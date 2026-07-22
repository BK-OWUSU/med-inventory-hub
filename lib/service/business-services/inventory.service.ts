import { AuditAction, AuditEntity, MovementReason, NotificationType, Prisma, StockMovementType, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/dbConnection";
import { generateNextCustomId } from "@/lib/utils";
import { addDrugInventoryBatchSchema, AddDrugInventoryBatchInput,UpdateDrugInventoryBatchInput, updateDrugInventoryBatchSchema, stockAdjustmentSchema, StockAdjustmentInput } from "@/types/schemas/inventory.schema";
import { AppResponse } from "@/types/types/app.type";
import { GlobalInventoryFilters, GlobalInventoryResponse, InventorySummary, LocalInventoryFilters, LocalInventoryResponse, PaginationMeta, StockAdjustmentRow, StockMovementPayload } from "@/types/types/inventory.type";
import { MovementFilters, StockMovementsSummary } from "@/types/types/stock-movement-adjusment.type";
import { NotificationService } from "./notification.service";

export class InventoryService {
  /**
   * Initializes a new drug batch inventory entry for a facility.
   * Performs duplication checks, registers the initial "IN" StockMovement using 
   * concurrent-safe custom sequence generation, and documents the event in the AuditLog.
   * * @param payload Structurally parsed data conforming to AddInventoryInput
   * @param userId The ID of the authenticated user initiating the inventory intake
   * @param facilityId The scope identifier extracted from the user's JWT session
   * @param ipAddress Optional IP trace
   */
 static async createDrugBatch(
  payload: AddDrugInventoryBatchInput,
  userId: string,
  facilityId: string,
  ipAddress?: string
): Promise<AppResponse> {
  try {
    // 1. Structural runtime validation check using Zod
    const validation = addDrugInventoryBatchSchema.safeParse(payload);
    if (!validation.success) {
      return {
        success: false,
        status: 400,
        error: validation.error.errors[0]?.message || "Invalid inventory payload.",
      } as AppResponse;
    }

    const validatedData = validation.data;
    const cleanBatch = validatedData.batchNumber.trim().toUpperCase();

    // 2. Prevent UI-level cross-contamination
    const drugExists = await prisma.drug.findUnique({
      where: { id: validatedData.drugId, isActive: true },
    });

    if (!drugExists) {
      return {
        success: false,
        status: 404,
        error: "Selected drug does not exist or has been deactivated.",
      } as AppResponse;
    }

    // 3. Enforce @@unique constraint
    const existingBatch = await prisma.inventory.findUnique({
      where: {
        facilityId_drugId_batchNumber: {
          facilityId,
          drugId: validatedData.drugId,
          batchNumber: cleanBatch,
        },
      },
    });

    if (existingBatch) {
      return {
        success: false,
        status: 409,
        error: `Batch "${cleanBatch}" already exists. Use "Update Stock" to adjust quantities.`,
      } as AppResponse;
    }

      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);
    // 4. Run database transaction
    const result = await prisma.$transaction(async (tx) => {
      const movementCustomId = await generateNextCustomId({
        tx,
        facilityId: facilityId, 
        sequenceType: "STOCK_MOVEMENT",
        prefix: "MV",
      });

      const inventory = await tx.inventory.create({
        data: {
          facilityId,
          drugId: validatedData.drugId,
          manufacturer: validatedData.manufacturer?.trim() || null,
          availableQuantity: validatedData.availableQuantity,
          unitPrice: validatedData.unitPrice ? new Prisma.Decimal(validatedData.unitPrice) : null,
          minStockLevel: validatedData.minStockLevel,
          batchNumber: cleanBatch,
          receivedDate: validatedData.receivedDate,
          expiryDate: validatedData.expiryDate,
        },
        include: {
          drug: { select: { id: true, name: true, strength: true, dosageForm: true, unit: true } },
        },
      });

      await tx.stockMovement.create({
        data: {
          customId: movementCustomId,
          inventoryId: inventory.id,
          type: StockMovementType.IN,
          quantity: validatedData.availableQuantity,
          referenceNo: cleanBatch,
          notes: `Initial inventory intake recorded for Batch ${cleanBatch}.`,
          performedById: userId,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          facilityId,
          action: AuditAction.INVENTORY_CREATED,
          entityType: AuditEntity.INVENTORY,
          entityId: inventory.id,
          ipAddress: ipAddress || null,
          details: {
            message: "New batch inventory initialized.",
            drugName: `${inventory.drug.name} ${inventory.drug.strength || ""}`,
            batchNumber: inventory.batchNumber,
          },
        },
      });

      if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {            
            // CALL THE NEW TRANSACTIONAL NOTIFICATION METHOD HERE
          await NotificationService.createNotificationInTx(
            tx, // Pass the transaction client
            facilityId,
            "New Inventory Batch Added",
            `A new batch (${inventory.batchNumber}) of ${inventory.drug.name} has been added.`,
            NotificationType.INVENTORY,
            recipientIds
          );
        }

      return inventory;
    });

    return {
      success: true,
      status: 201,
      message: `Inventory batch "${cleanBatch}" for ${result.drug.name} registered successfully.`,
      data: result,
    } as AppResponse;

  } catch (error) {
    console.error("🚨 Critical System Level Create-Inventory Service Error:", error);
    return {
      success: false,
      status: 500,
      error: "Internal failure occurred while processing inventory intake.",
    } as AppResponse;
  }
}


/**
   * Updates an existing drug batch inventory entry.
   * Performs scope checks, updates the record, and documents the event in the AuditLog.
   * 
   * @param inventoryId The ID of the inventory record to update
   * @param payload Structurally parsed data conforming to UpdateDrugInventoryBatchInput
   * @param userId The ID of the authenticated user
   * @param facilityId The scope identifier extracted from the user's JWT session
   * @param ipAddress Optional IP trace
   */
  static async updateDrugInventoryBatch(
    inventoryId: string,
    payload: UpdateDrugInventoryBatchInput,
    userId: string,
    facilityId: string,
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      // 1. Structural runtime validation check using Zod
      const validation = updateDrugInventoryBatchSchema.safeParse(payload);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: validation.error.errors[0]?.message || "Invalid update payload.",
        } as AppResponse;
      }

      const validatedData = validation.data;

      // 2. Ensure inventory exists and belongs to the current facility (Security Constraint)
      const existingInventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: { drug: true },
      });

      if (!existingInventory || existingInventory.facilityId !== facilityId) {
        return {
          success: false,
          status: 404,
          error: "Inventory record not found in this facility.",
        } as AppResponse;
      }

      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);

      // 3. Run database transaction
      const result = await prisma.$transaction(async (tx) => {
        const updatedInventory = await tx.inventory.update({
          where: { id: inventoryId },
          data: {
            manufacturer: validatedData.manufacturer?.trim() || existingInventory.manufacturer,
            unitPrice: validatedData.unitPrice !== undefined ? new Prisma.Decimal(validatedData.unitPrice) : existingInventory.unitPrice,
            minStockLevel: validatedData.minStockLevel,
            expiryDate: validatedData.expiryDate,
            isActive: validatedData.isActive,
          },
          include: {
            drug: { select: { id: true, name: true, strength: true, dosageForm: true } },
          },
        });

        // Audit Log entry
        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.INVENTORY_UPDATED,
            entityType: AuditEntity.INVENTORY,
            entityId: inventoryId,
            ipAddress: ipAddress || null,
            details: {
              message: "Inventory batch details updated.",
              drugName: `${updatedInventory.drug.name} ${updatedInventory.drug.strength || ""}`,
              batchNumber: updatedInventory.batchNumber,
              changes: {
                manufacturer: validatedData.manufacturer,
                unitPrice: validatedData.unitPrice,
                expiryDate: validatedData.expiryDate,
              },
            },
          },
        });

        // Notifications
        if (recipientIds.length > 0) {
          if (updatedInventory.availableQuantity <= updatedInventory.minStockLevel) {
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "Low Stock Alert",
              `Low stock: ${updatedInventory.drug.name} (${updatedInventory.batchNumber}) is now below the updated minimum level (${updatedInventory.availableQuantity} available).`,
              NotificationType.INVENTORY,
              recipientIds
            );
          }
        }

        return updatedInventory;
      });

      return {
        success: true,
        status: 200,
        message: `Inventory batch "${result.batchNumber}" for ${result.drug.name} updated successfully.`,
        data: result,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Update-Inventory Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal failure occurred while updating inventory.",
      } as AppResponse;
    }
  }


  /**
   * Deactivates an inventory batch and notifies relevant staff.
   */
  static async deactivateInventory(
    inventoryId: string,
    userId: string,
    facilityId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      // 1. Verify existence and facility ownership
      const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: { drug: { select: { name: true, strength: true } } },
      });

      if (!inventory || inventory.facilityId !== facilityId) {
        return {
          success: false,
          status: 404,
          error: "Inventory record not found or access denied.",
        } as AppResponse;
      }

      if (!inventory.isActive) {
        return {
          success: false,
          status: 400,
          error: "Inventory batch is already deactivated.",
        } as AppResponse;
      }

      // 2. Fetch recipients for notification
      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);

      // 3. Run transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update the status
        const deactivatedInventory = await tx.inventory.update({
          where: { id: inventoryId },
          data: { isActive: false },
        });

        // Audit Log entry
        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.INVENTORY_UPDATED, // Or a specific DEACTIVATED action if your Enum has it
            entityType: AuditEntity.INVENTORY,
            userAgent: userAgent,
            entityId: inventoryId,
            ipAddress: ipAddress || null,
            details: {
              message: "Inventory batch deactivated.",
              drugName: `${inventory.drug.name} ${inventory.drug.strength || ""}`,
              batchNumber: inventory.batchNumber,
            },
          },
        });

        // Trigger Notification
        if (recipientIds.length > 0) {
          await NotificationService.createNotificationInTx(
            tx,
            facilityId,
            "Inventory Batch Deactivated",
            `Batch (${inventory.batchNumber}) of ${inventory.drug.name} has been deactivated.`,
            NotificationType.INVENTORY,
            recipientIds
          );
        }

        return deactivatedInventory;
      });

      return {
        success: true,
        status: 200,
        message: `Inventory batch "${result.batchNumber}" has been deactivated and team notified.`,
        data: result,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical Error in deactivateInventory Service:", error);
      return {
        success: false,
        status: 500,
        error: "Internal failure occurred while deactivating inventory.",
      } as AppResponse;
    }
  }


  /**
   * Fetches detailed information for a single inventory batch,
   * including the linked drug information and recent stock movements.
   * 
   * @param inventoryId The unique ID of the inventory batch
   * @param facilityId The facility scope for security verification
   */
  static async getInventoryBatchDetails(
    inventoryId: string,
    facilityId: string
  ): Promise<AppResponse> {
    try {
      // Fetch batch with nested drug and recent movements
      const inventory = await prisma.inventory.findUnique({
        where: { id: inventoryId },
        include: {
          drug: {
            select: {
              id: true,
              name: true,
              strength: true,
              dosageForm: true,
              unit: true,
              genericName: true,
              isControlled: true,
            },
          },
          movements: {
            take: 10, // Get only the 10 most recent movements
            orderBy: { performedAt: "desc" },
            include: {
              performedBy: { select: { fullName: true } },
            },
          },
        },
      });

      // Security Check: Ensure the inventory belongs to the requested facility
      if (!inventory) {
        return {
          success: false,
          status: 404,
          error: "Inventory batch not found.",
        } as AppResponse;
      }

      if (inventory.facilityId !== facilityId) {
        return {
          success: false,
          status: 403,
          error: "Unauthorized access to this inventory batch.",
        } as AppResponse;
      }

      // Destructure for the specific return format you requested
      const responseData = {
        inventory: {
          id: inventory.id,
          batchNumber: inventory.batchNumber,
          availableQuantity: inventory.availableQuantity,
          unitPrice: inventory.unitPrice,
          minStockLevel: inventory.minStockLevel,
          expiryDate: inventory.expiryDate,
          receivedDate: inventory.receivedDate,
          manufacturer: inventory.manufacturer,
        },
        drug: inventory.drug,
        recentMovements: inventory.movements,
      };

      return {
        success: true,
        status: 200,
        message: "Inventory batch details retrieved successfully.",
        data: responseData,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Error in getInventoryBatchDetails Service:", error);
      return {
        success: false,
        status: 500,
        error: "Failed to load inventory batch details.",
      } as AppResponse;
    }
  }
  
 /**
   * Fetches local facility inventory.
   * Concurrently runs fetch and count queries, populating AppResponse.meta with pagination metadata.
   */
  static async getLocalInventory(
    facilityId: string,
    filters?: LocalInventoryFilters
  ): Promise<AppResponse> {
    try {
      const cleanSearch = filters?.search?.trim();
      const targetDays = filters?.daysToExpiry ?? 30;
      
      const limit = filters?.limit;
      const page = filters?.page;
      const skip = limit && page && page > 0 ? (page - 1) * limit : undefined;
      const take = limit && limit > 0 ? limit : undefined;

      const whereClause: Prisma.InventoryWhereInput = {
        facilityId,
        isDeleted: false,
        ...(filters?.drugId ? { drugId: filters.drugId } : {}),
        
        ...(cleanSearch && cleanSearch !== ""
          ? {
              drug: {
                OR: [
                  { name: { contains: cleanSearch, mode: "insensitive" } },
                  { genericName: { contains: cleanSearch, mode: "insensitive" } },
                ],
              },
            }
          : {}),

        ...(filters?.isLowStock
          ? {
              availableQuantity: {
                lte: prisma.inventory.fields.minStockLevel,
              },
            }
          : {}),

        ...(filters?.isExpiringSoon
          ? {
              expiryDate: {
                lte: new Date(Date.now() + targetDays * 24 * 60 * 60 * 1000),
                gte: new Date(),
              },
            }
          : {}),
      };

      // Query database concurrently to optimize server response times
      const [inventories, totalMatchingCount] = await Promise.all([
        prisma.inventory.findMany({
          where: whereClause,
          include: {
            drug: {
              select: {
                id: true,
                name: true,
                strength: true,
                dosageForm: true,
                unit: true,
              },
            },
          },
          orderBy: {
            expiryDate: "asc",
          },
          ...(take !== undefined ? { take } : {}),
          ...(skip !== undefined ? { skip } : {}),
        }),
        prisma.inventory.count({ where: whereClause }),
      ]);

      const responseData: LocalInventoryResponse = { inventories };

      // Construct Pagination Meta Object
      const resolvedLimit = take ?? totalMatchingCount;
      const resolvedPage = page ?? 1;
      const totalPages = resolvedLimit > 0 ? Math.ceil(totalMatchingCount / resolvedLimit) : 1;

      const paginationMeta: PaginationMeta = {
        total: totalMatchingCount,
        page: resolvedPage,
        limit: resolvedLimit,
        totalPages,
        hasNextPage: resolvedPage < totalPages,
        hasPrevPage: resolvedPage > 1,
      };

      return {
        success: true,
        status: 200,
        message: "Local facility inventory retrieved successfully.",
        data: responseData,
        meta: paginationMeta, // Set metadata type-safely here!
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical Error in getLocalInventory Service:", error);
      return {
        success: false,
        status: 500,
        error: "Failed to load local facility inventory records.",
      } as AppResponse;
    }
  }

  /**
   * Fetches global active inventory across external facilities.
   * used in Orders/ market place
   * Concurrently runs fetch and count queries, populating AppResponse.meta with pagination metadata.
   */
  static async getGlobalInventory(
    currentFacilityId: string,
    filters?: GlobalInventoryFilters
  ): Promise<AppResponse> {
    try {
      const cleanSearch = filters?.search?.trim();
      
      const limit = filters?.limit;
      const page = filters?.page;
      const skip = limit && page && page > 0 ? (page - 1) * limit : undefined;
      const take = limit && limit > 0 ? limit : undefined;

      // Clean, single-declaration where clause
      const whereClause: Prisma.InventoryWhereInput = {
        facilityId: { not: currentFacilityId },
        isDeleted: false,
        availableQuantity: { gt: 0 },

        // 1. Direct foreign key check (avoids nesting if we just have the ID)
        ...(filters?.drugId ? { drugId: filters.drugId } : {}),

        // 2. Single Facility Relation Block
        facility: {
          isVerified: true,
          isActive: true,
          ...(filters?.facilityType ? { type: filters.facilityType } : {}),
        },

        // 3. Single Drug Relation Block (guarantees we only query active catalog items)
        drug: {
          isActive: true,
          ...(cleanSearch && cleanSearch !== ""
            ? {
                OR: [
                  { name: { contains: cleanSearch, mode: "insensitive" } },
                  { genericName: { contains: cleanSearch, mode: "insensitive" } },
                ],
              }
            : {}),
        },
      };

      // Query database concurrently to optimize server response times
      const [inventories, totalMatchingCount] = await Promise.all([
        prisma.inventory.findMany({
          where: whereClause,
          include: {
            drug: {
              select: {
                id: true,
                name: true,
                dosageForm: true,
                unit: true,
                strength: true,
                _count: {
                  select: {
                    inventories: true
                  },
                },
              },
            },
            facility: {
              select: {
                id: true,
                name: true,
                type: true,
                location: true
              },
            },
          },
          orderBy: [
            { drug: { name: "asc" } },
            { availableQuantity: "desc" },
          ],
          ...(take !== undefined ? { take } : {}),
          ...(skip !== undefined ? { skip } : {}),
        }),
        prisma.inventory.count({ where: whereClause }),
      ]);

      const responseData: GlobalInventoryResponse = { inventories };

      // Construct Pagination Meta Object
      const resolvedLimit = take ?? totalMatchingCount;
      const resolvedPage = page ?? 1;
      const totalPages = resolvedLimit > 0 ? Math.ceil(totalMatchingCount / resolvedLimit) : 1;

      const paginationMeta: PaginationMeta = {
        total: totalMatchingCount,
        page: resolvedPage,
        limit: resolvedLimit,
        totalPages,
        hasNextPage: resolvedPage < totalPages,
        hasPrevPage: resolvedPage > 1,
      };

      return {
        success: true,
        status: 200,
        message: "Global inter-facility inventory registry retrieved successfully.",
        data: responseData,
        meta: paginationMeta,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical Error in getGlobalInventory Service:", error);
      return {
        success: false,
        status: 500,
        error: "Failed to load global inventory pool.",
      } as AppResponse;
    }
  }

static async getStockMovementDetails(
    movementId: string,
    facilityId: string
  ): Promise<AppResponse> {
    try {
      const movement = await prisma.stockMovement.findUnique({
        where: { id: movementId },
        include: {
          inventory: {
            include: {
              drug: { select: { name: true, strength: true, dosageForm: true, unit: true } }
            }
          },
          orderItem: {
            include: {
              order: true 
            }
          },
          performedBy: { select: { fullName: true, id: true } }
        },
      });

      // Security: Ensure the movement belongs to the facility
      if (!movement || movement.inventory.facilityId !== facilityId) {
        return {
          success: false,
          status: 404,
          error: "Movement record not found or access denied.",
        } as AppResponse;
      }

      const movementData = {
          movement: {
            id: movement.id,
            customId: movement.customId, // Added for UI display
            type: movement.type,
            quantity: movement.quantity,
            notes: movement.notes,
            referenceNo: movement.referenceNo,
            performedAt: movement.performedAt,
          },
          inventory: {
            ...movement.inventory,
            unitPrice: movement.inventory.unitPrice ? movement.inventory.unitPrice.toNumber() : null,
          },
          order: movement.orderItem?.order ? {
            ...movement.orderItem.order,
            totalValue: movement.orderItem.order.totalValue ? movement.orderItem.order.totalValue.toNumber() : null,
          } : null,
          performedBy: movement.performedBy,
        } as StockMovementPayload

      return {
        success: true,
        status: 200,
        message: "Movement details retrieved successfully.",
        data: movementData
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Error in getStockMovementDetails:", error);
      return {
        success: false,
        status: 500,
        error: "Failed to load movement details.",
      } as AppResponse;
    }
  }

  /* 
 * GET STOCK MOVEMENTS 
 */
static async getStockMovements(
  facilityId: string,
  filters?: MovementFilters
): Promise<AppResponse> {
  try {
    const cleanSearch = filters?.search?.trim();
    const limit = filters?.limit;
    const page = filters?.page;
    const skip = limit && page && page > 0 ? (page - 1) * limit : undefined;
    const take = limit && limit > 0 ? limit : undefined;

    // Updated whereClause with drugId and performedById filters
    const whereClause: Prisma.StockMovementWhereInput = {
      inventory: { 
        facilityId,
        ...(filters?.drugId ? { drugId: filters.drugId } : {}) 
      },
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.performedBy ? { performedById: filters.performedBy } : {}),
      ...(filters?.startDate || filters?.endDate
        ? {
            performedAt: {
              ...(filters.startDate ? { gte: filters.startDate } : {}),
              ...(filters.endDate ? { lte: filters.endDate } : {}),
            },
          }
        : {}),
      ...(cleanSearch && cleanSearch !== ""
        ? {
            OR: [
              { referenceNo: { contains: cleanSearch, mode: "insensitive" } },
              { customId: { contains: cleanSearch, mode: "insensitive" } },
              {
                inventory: {
                  OR: [
                    { batchNumber: { contains: cleanSearch, mode: "insensitive" } },
                    { drug: { name: { contains: cleanSearch, mode: "insensitive" } } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [movements, totalMatchingCount, aggregates] = await Promise.all([
      prisma.stockMovement.findMany({
        where: whereClause,
        include: {
          inventory: {
            include: {
              drug: {
                select: { name: true, strength: true, dosageForm: true, unit: true },
              },
            },
          },
          performedBy: { select: { fullName: true } },
        },
        orderBy: { performedAt: "desc" },
        ...(take !== undefined ? { take } : {}),
        ...(skip !== undefined ? { skip } : {}),
      }),
      prisma.stockMovement.count({ where: whereClause }),
      prisma.stockMovement.groupBy({
        by: ["type"],
        where: { inventory: { facilityId }, ...whereClause },
        _sum: { quantity: true },
        _count: { id: true },
      }),
    ]);

    let totalIn = 0;
    let totalOut = 0;
    let adjustmentsCount = 0;
    let expiryLossCount = 0;

    aggregates.forEach((group) => {
      const sum = Math.abs(group._sum.quantity ?? 0);
      const count = group._count.id ?? 0;

      if (group.type === "IN" || group.type === "RETURN") {
        totalIn += sum;
      } else if (group.type === "OUT" || group.type === "TRANSFER") {
        totalOut += sum;
      } else if (group.type === "ADJUSTMENT") {
        adjustmentsCount += count;
      } else if (group.type === "EXPIRY") {
        expiryLossCount += count;
      }
    });

    const summary: StockMovementsSummary = {
      totalIn,
      totalOut,
      adjustmentsCount,
      expiryLossCount,
      netMovement: totalIn - totalOut,
    };

    const resolvedLimit = take ?? totalMatchingCount;
    const resolvedPage = page ?? 1;
    const totalPages = resolvedLimit > 0 ? Math.ceil(totalMatchingCount / resolvedLimit) : 1;

    const paginationMeta: PaginationMeta = {
      total: totalMatchingCount,
      page: resolvedPage,
      limit: resolvedLimit,
      totalPages,
      hasNextPage: resolvedPage < totalPages,
      hasPrevPage: resolvedPage > 1,
    };

    return {
      success: true,
      status: 200,
      message: "Stock movement ledger loaded successfully.",
      data: { movements, summary },
      meta: paginationMeta,
    } as AppResponse;

  } catch (error) {
    console.error("🚨 Error in getStockMovements Service:", error);
    return {
      success: false,
      status: 500,
      error: "Failed to load stock movement records.",
    } as AppResponse;
  }
}

/**
   * B. Create Adjustment (Refactored to Unified Service)
   * Delegates logic to processStockMovement to ensure consistent logging,
   * audit trails, and automatic notification triggering.
   */
  static async createAdjustment(
    payload: StockAdjustmentInput,
    userId: string,
    facilityId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    return await this.processStockMovement(
      {
        ...payload,
        type: payload.type || StockMovementType.ADJUSTMENT, 
      },
      userId,
      facilityId,
      ipAddress,
      userAgent
    );
  }

/**
 * Unified service method to handle all stock interactions.
 * Handles both "Delta" movements (IN/OUT/TRANSFER) and "Absolute" adjustments.
 */
static async processStockMovement(
    input: StockAdjustmentInput,
    userId: string,
    facilityId: string,
    ipAddress?: string,
    userAgent?: string,
    prismaTx?: Prisma.TransactionClient // Optional: accepts external tx or creates one
  ): Promise<AppResponse> {
    try {
      const validatedData = stockAdjustmentSchema.parse(input);

      // 1. Prepare recipients outside the transaction (read-only)
      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);

      // Encapsulate the core transactional logic inside a helper function
      const executeStockMovement = async (tx: Prisma.TransactionClient) => {
        // 2. Fetch current state
        const item = await tx.inventory.findUnique({
          where: { id: validatedData.inventoryId },
          include: { drug: { select: { name: true, strength: true } } }
        });

        if (!item || item.facilityId !== facilityId) {
          throw new Error("Inventory record not found or unauthorized.");
        }

        // Capture previous quantity before modification
        const previousQuantity = item.availableQuantity;

        // 3. Determine the Delta and Final Qty
        let finalQuantity: number;
        let quantityToRecord: number;

        if (validatedData.newQuantity !== undefined) {
          finalQuantity = validatedData.newQuantity;
          quantityToRecord = validatedData.newQuantity - previousQuantity;
        } else if (validatedData.quantityChange !== undefined) {
          finalQuantity = previousQuantity + validatedData.quantityChange;
          quantityToRecord = validatedData.quantityChange;
        } else {
          throw new Error("Must provide either newQuantity or quantityChange.");
        }

        if (finalQuantity < 0) throw new Error("Resulting stock cannot be negative.");

        // 4. Update Inventory
        const updatedInventory = await tx.inventory.update({
          where: { id: validatedData.inventoryId },
          data: { availableQuantity: finalQuantity },
          include: { drug: { select: { name: true } } }
        });

       // 5. Log Movement with immutable snapshot quantities
        const customId = await generateNextCustomId({ tx, facilityId, sequenceType: "STOCK_MOVEMENT", prefix: "MV" });
        const movement = await tx.stockMovement.create({
          data: {
            customId,
            inventoryId: validatedData.inventoryId,
            orderItemId: validatedData.orderItemId || null,
            type: validatedData.type,
            quantity: quantityToRecord,
            previousQuantity: previousQuantity,
            newQuantity: finalQuantity,
            referenceNo: validatedData.referenceNo || item.batchNumber || "N/A",
            notes: validatedData.notes || `Manual ${validatedData.type} adjustment.`,
            reason: validatedData.reason,
            performedById: userId,
          },
        });
        // 6. Audit Log
        await tx.auditLog.create({
          data: {
            userId, facilityId,
            action: AuditAction.INVENTORY_UPDATED,
            entityType: AuditEntity.INVENTORY,
            entityId: item.id,
            ipAddress, userAgent,
            details: {
              message: "Stock modified.",
              drugName: `${item.drug.name} ${item.drug.strength || ""}`.trim(),
              batchNumber: item.batchNumber || "N/A",
              movementType: validatedData.type,
              previousQuantity,
              quantityChanged: quantityToRecord,
              newQuantity: finalQuantity
            },
          },
        });

        // 7. Integrated Notifications
        if (recipientIds.length === 0) {
          console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
        } else {
          await NotificationService.createNotificationInTx(
            tx,
            facilityId,
            `Stock ${validatedData.type.charAt(0) + validatedData.type.slice(1).toLowerCase()} Processed`,
            `Movement recorded: ${validatedData.type} for ${item.drug.name} (${item.batchNumber || 'No Batch'}). New Balance: ${finalQuantity}`,
            NotificationType.INVENTORY,
            recipientIds
          );

          if (finalQuantity <= item.minStockLevel) {
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "Low Stock Warning",
              `Warning: ${item.drug.name} (${item.batchNumber || 'No Batch'}) is at or below minimum stock level (${finalQuantity} remaining).`,
              NotificationType.INVENTORY,
              recipientIds
            );
          }
        }

        return { updatedInventory, movement };
      };

      // Execute either within the provided external transaction or start a new one
      let result;
      if (prismaTx) {
        result = await executeStockMovement(prismaTx);
      } else {
        result = await prisma.$transaction(async (tx) => {
          return await executeStockMovement(tx);
        });
      }

      return { success: true, status: 200, message: "Transaction processed successfully.", data: result };
    } catch (error: unknown) {
      console.error("🚨 Error in processStockMovement:", error);
      // If it's part of an external transaction, rethrow so the parent transaction rolls back
      if (prismaTx) throw error;
      return { success: false, status: 400, error: (error as Error).message || "Failed to process stock movement." };
    }
  }


/**
 * Fetches a paginated list of stock adjustments.
 */
static async getAdjustments(
  facilityId: string,
  filters?: {
    drugId?: string;
    user?: string;
    reason?: MovementReason;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
): Promise<AppResponse> {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.StockMovementWhereInput = {
      type: StockMovementType.ADJUSTMENT,
      inventory: {
        facilityId,
        ...(filters?.drugId ? { drugId: filters.drugId } : {}),
      },
      ...(filters?.user ? { performedById: filters.user } : {}),
      ...(filters?.reason ? { reason: filters.reason } : {}),
      ...(filters?.startDate || filters?.endDate ? {
        performedAt: {
          ...(filters.startDate ? { gte: filters.startDate } : {}),
          ...(filters.endDate ? { lte: filters.endDate } : {}),
        },
      } : {}),
    };

    const [adjustments, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: whereClause,
        include: {
          inventory: { 
            include: { 
              drug: { select: { name: true, strength: true, unit: true } } 
            } 
          },
          performedBy: { select: { fullName: true, role: true } },
        },
        orderBy: { performedAt: "desc" },
        take: limit,
        skip: skip,
      }),
      prisma.stockMovement.count({ where: whereClause }),
    ]);

    const data: StockAdjustmentRow[] = adjustments.map((adj) => {
      const oldQty = adj.previousQuantity ?? 0;
      const newQty = adj.newQuantity ?? 0;
      const diff = adj.quantity ?? (newQty - oldQty);
      
      const drugFullName = `${adj.inventory.drug.name} ${adj.inventory.drug.strength || ""}`.trim();
      const batch = adj.inventory.batchNumber || "N/A";

      return {
        id: adj.id,
        customId: adj.customId,
        dateTime: adj.performedAt,
        drugName: drugFullName,
        batchNumber: batch,
        inventoryName: adj.inventory.manufacturer 
          ? `${drugFullName} — ${adj.inventory.manufacturer}` 
          : drugFullName,
        inventoryBatch: batch,
        oldQuantity: oldQty,
        newQuantity: newQty,
        difference: diff,
        reason: adj.reason ? adj.reason.replace(/_/g, " ") : "N/A",
        reference: adj.referenceNo || "N/A",
        performedBy: adj.performedBy.fullName,
        role: adj.performedBy.role,
      };
    });

    return {
      success: true,
      status: 200,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    } as AppResponse;
  } catch (error) {
    console.error("🚨 Error in getAdjustments:", error);
    return { success: false, status: 500, error: "Failed to load adjustments." } as AppResponse;
  }
}
  
//===================================================  
  /**
 * Fetches high-level summary statistics for a facility's dashboard widgets.
 */
static async getInventorySummary(facilityId: string): Promise<AppResponse> {
  try {
    const targetExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days out

    // Perform database count queries concurrently
    const [totalItems, lowStockItems, expiringSoonItems, outOfStockItems] = await Promise.all([
      prisma.inventory.count({
        where: { facilityId, isActive: true,isDeleted: false}
      }),
      prisma.inventory.count({
        where: {
          facilityId,
          isActive: true,
          availableQuantity: { lte: prisma.inventory.fields.minStockLevel }
        }
      }),
      prisma.inventory.count({
        where: {
          facilityId,
          isActive: true,
          expiryDate: { lte: targetExpiryDate, gte: new Date() }
        }
      }),
      prisma.inventory.count({
        where: { facilityId, isActive: true, availableQuantity: 0 }
      })
    ]);

    const summary: InventorySummary = {
      totalItems,
      lowStockCount: lowStockItems,
      expiringSoonCount: expiringSoonItems,
      outOfStockCount: outOfStockItems
    };

    return {
      success: true,
      status: 200,
      message: "Inventory dashboard summary retrieved successfully.",
      data: summary
    } as AppResponse;

  } catch (error) {
    console.error("🚨 Error in getInventorySummary Service:", error);
    return {
      success: false,
      status: 500,
      error: "Failed to load inventory summary statistics."
    } as AppResponse;
  }
}

}