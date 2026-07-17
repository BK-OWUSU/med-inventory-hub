import { AuditAction, AuditEntity, NotificationType, Prisma, StockMovementType, UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/dbConnection";
import { generateNextCustomId } from "@/lib/utils";
import { addInventorySchema, AddInventoryInput, UpdateStockInput, updateStockSchema } from "@/types/schemas/inventory.schema";
import { AppResponse } from "@/types/types/app.type";
import { GlobalInventoryFilters, GlobalInventoryResponse, InventorySummary, LocalInventoryFilters, LocalInventoryResponse, PaginationMeta, StockAdjustmentInput } from "@/types/types/inventory.type";
import { ExecuteAdjustmentInput, MovementFilters, StockMovementsSummary } from "@/types/types/stock-movement-adjusment.type";
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
 static async createInventory(
  payload: AddInventoryInput,
  userId: string,
  facilityId: string,
  ipAddress?: string
): Promise<AppResponse> {
  try {
    // 1. Structural runtime validation check using Zod
    const validation = addInventorySchema.safeParse(payload);
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
        sequenceType: "MOV",
        prefix: "MOV",
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
   * Adjusts stock levels for an existing inventory batch.
   * Calculates new available quantities based on movement type, enforces safety minimums 
   * (no negative stock), records the StockMovement, and logs an Audit trace.
   * * @param payload Structurally parsed data conforming to UpdateStockInput
   * @param userId The ID of the authenticated user performing this movement
   * @param facilityId The scope identifier extracted from the user's JWT session
   * @param ipAddress Optional IP trace
   */
  static async updateStock(
    payload: UpdateStockInput,
    userId: string,
    facilityId: string,
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      // 1. Structural runtime validation check using Zod
      const validation = updateStockSchema.safeParse(payload);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: validation.error.errors[0]?.message || "Invalid stock update payload.",
        } as AppResponse;
      }

      const { inventoryId, type, quantity, notes } = validation.data;

      // 2. Fetch the existing inventory record and check multi-tenant scope
      const existingInventory = await prisma.inventory.findFirst({
        where: { id: inventoryId },
        include: {
          drug: {
            select: {
              name: true,
              strength: true,
            },
          },
        },
      });

      if (!existingInventory) {
        return {
          success: false,
          status: 404,
          error: "Inventory batch record not found.",
        } as AppResponse;
      }

      // Security Check: Verify that the inventory batch belongs to the logged-in user's facility
      if (existingInventory.facilityId !== facilityId) {
        return {
          success: false,
          status: 403,
          error: "Unauthorized. You do not have permission to modify inventory at another facility.",
        } as AppResponse;
      }

      // 3. Determine mathematical direction based on StockMovementType
      let isAddition = false;

      switch (type) {
        case StockMovementType.IN:
        case StockMovementType.RETURN:
          isAddition = true;
          break;
        case StockMovementType.OUT:
        case StockMovementType.EXPIRY:
        case StockMovementType.TRANSFER: // Assuming manual transfer-out of stock
        case StockMovementType.ADJUSTMENT: // Defaulting manual adjustment to subtraction (shrinkage/breakage)
          isAddition = false;
          break;
        default:
          return {
            success: false,
            status: 400,
            error: `Unsupported stock movement type: ${type}`,
          } as AppResponse;
      }

      // Calculate the theoretical new total
      const currentQty = existingInventory.availableQuantity;
      const newQty = isAddition ? currentQty + quantity : currentQty - quantity;

      // Enforce physical bounds: Stock cannot drop below zero
      if (newQty < 0) {
        return {
          success: false,
          status: 400,
          error: `Insufficient stock. Attempting to withdraw ${quantity} units, but only ${currentQty} units are available.`,
        } as AppResponse;
      }

      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);
      // 4. Execute atomic transaction for state changes
      const updatedInventory = await prisma.$transaction(async (tx) => {
        // A. Generate Custom Movement ID inside the transaction
        const movementCustomId = await generateNextCustomId({
          tx,
          facilityId,
          sequenceType: "STOCK_MOVEMENT",
          prefix: "MV",
        });

        // B. Update the inventory level
        const inventory = await tx.inventory.update({
          where: { id: inventoryId },
          data: {
            availableQuantity: newQty,
          },
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
        });

        // C. Log the transaction to StockMovements ledger
        await tx.stockMovement.create({
          data: {
            customId: movementCustomId,
            inventoryId: inventory.id,
            type,
            quantity,
            referenceNo: inventory.batchNumber,
            notes: notes?.trim() || `Manual ${type} adjustment recorded.`,
            performedById: userId,
          },
        });

        // D. Create trace in System Audit Log
        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.INVENTORY_UPDATED,
            entityType: AuditEntity.INVENTORY,
            entityId: inventory.id,
            ipAddress: ipAddress || null,
            details: {
              message: "Stock level modified via movement transaction.",
              drugName: `${inventory.drug.name} ${inventory.drug.strength || ""}`,
              batchNumber: inventory.batchNumber,
              movementType: type,
              movementQuantity: quantity,
              previousQuantity: currentQty,
              newQuantity: newQty,
              notes,
            },
          },
        });

        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {
            // ---TRANSACTIONAL NOTIFICATIONS ---
            // 1. Notify the specific movement
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              `Stock ${type.charAt(0) + type.slice(1).toLowerCase()} Processed`,
              `Movement recorded: ${type} for ${inventory.drug.name} (${inventory.batchNumber}). New Balance: ${newQty}`,
              NotificationType.INVENTORY,
              recipientIds
            );            
          }


          // 2. Alert if stock is low
          if (newQty <= inventory.minStockLevel) {
            if (recipientIds.length === 0) {
              console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
              // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
            } else {
              await NotificationService.createNotificationInTx(
                tx,
                facilityId,
                "Low Stock Warning",
                `Warning: ${inventory.drug.name} (${inventory.batchNumber}) is at or below minimum stock level (${newQty} remaining).`,
                NotificationType.INVENTORY,
                recipientIds
              );
            }
          }



        return inventory;
      });

      return {
        success: true,
        status: 200,
        message: `Successfully processed ${type} movement of ${quantity} units for ${updatedInventory.drug.name}.`,
        data: updatedInventory,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Update-Stock Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal failure occurred while recording stock movement and updating ledger.",
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
        isActive: true,
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
        isActive: true,
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
              },
            },
            facility: {
              select: {
                id: true,
                name: true,
                type: true,
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

/* 
 *GET STOCK MOVEMENTS 
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
  
        const whereClause: Prisma.StockMovementWhereInput = {
          inventory: { facilityId },
          ...(filters?.type ? { type: filters.type } : {}),
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
              performedBy: { select: { fullName: true } }, // Matches User model 'fullName'
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
          } else if (group.type === "EXPIRY") { // Aligned directly with your schema enum
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
 * Safe transaction to edit stock levels, generate sequential customIds, 
 * register the stock movement, and create a system audit log.
 */
static async executeStockAdjustment(
    input: ExecuteAdjustmentInput, 
    userId: string,
    facilityId: string, 
    ipAddress: string, 
    userAgent:string
    ): Promise<AppResponse> {

      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);
  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Find the parent inventory profile with drug details included
      const item = await tx.inventory.findUnique({
        where: { id: input.inventoryId },
        include: {
          drug: {
            select: { name: true, strength: true },
          },
        },
      });

      if (!item || item.facilityId !== facilityId) {
        throw new Error("Inventory target profile not found or facility mismatched.");
      }

      // 2. Adjust balance safely
      const newQuantity = item.availableQuantity + input.quantityChange;
      if (newQuantity < 0) {
        throw new Error("Cannot complete operation: requested quantity would result in negative stock.");
      }

      // 3. Generate sequential movement Custom ID using the sequence manager
      const customId = await generateNextCustomId({
        tx,
        facilityId: facilityId, 
        sequenceType: "STOCK_MOVEMENT",
        prefix: "MV",
      });

      // 4. Update core inventory level
      const updatedInventory = await tx.inventory.update({
        where: { id: input.inventoryId },
        data: { availableQuantity: newQuantity },
        include: { drug: { select: { name: true } } },
      });

      // 5. Append physical stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          customId,
          inventoryId: input.inventoryId,
          type: input.type,
          quantity: input.quantityChange,
          referenceNo: input.referenceNo,
          notes: input.notes,
          performedById: userId,
        },
      });

      // 6. Append System Audit Log entry
      await tx.auditLog.create({
        data: {
          userId: userId,
          facilityId: facilityId,
          action: AuditAction.INVENTORY_UPDATED,
          entityType: AuditEntity.INVENTORY,
          entityId: item.id,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          details: {
            message: "Stock level modified via manual inventory action.",
            drugName: `${item.drug.name} ${item.drug.strength || ""}`.trim(),
            batchNumber: item.batchNumber || "N/A",
            movementCustomId: customId,
            movementType: input.type,
            movementQuantity: input.quantityChange,
            previousQuantity: item.availableQuantity,
            newQuantity: newQuantity,
            notes: input.notes || null,
          },
        },
      });

      // --- TRANSACTIONAL NOTIFICATIONS ---

      if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {
            
            // A. Notify that the adjustment was performed
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "Stock Adjustment Processed",
              `Adjustment for ${item.drug.name} (${item.batchNumber || 'No Batch'}): ${input.quantityChange > 0 ? '+' : ''}${input.quantityChange} units. New Balance: ${newQuantity}.`,
              NotificationType.INVENTORY,
              recipientIds
            );
          }


          
          // B. Trigger Low Stock alert if necessary
          if (newQuantity <= item.minStockLevel) {
        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {
            
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "Low Stock Warning",
              `Alert: ${item.drug.name} (${item.batchNumber || 'No Batch'}) is at or below minimum stock level (${newQuantity} remaining).`,
              NotificationType.INVENTORY,
              recipientIds
            );
          }
      }

      return { updatedInventory, movement };
    });

    return {
      success: true,
      status: 201,
      message: `Successfully updated stock levels for ${transactionResult.updatedInventory.drug.name}.`,
      data: transactionResult,
    } as AppResponse;

  } catch (error: unknown) {
    console.error("🚨 Inventory mutation rolled back safely:", error);
    return {
      success: false,
      status: 400,
      error: (error as Error).message || "Failed to process stock adjustment safely.",
    } as AppResponse;
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
        where: { facilityId, isActive: true }
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