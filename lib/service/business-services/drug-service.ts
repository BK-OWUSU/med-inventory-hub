import { prisma } from "@/lib/database/dbConnection";
import { drugFormSchema, DrugFormValues, updateDrugFormSchema, UpdateDrugFormValues } from "@/types/schemas/drug.schema";
import { AppResponse } from "@/types/types/app.type";
import { generateNextCustomId } from "@/lib/utils";
import { AuditAction, AuditEntity, DosageForm, NotificationType, UserRole } from "@/generated/prisma/enums";
import { Drug, Prisma } from "@/generated/prisma/client";
import { NotificationService } from "./notification.service";



// Explicit interface for intermediate structural processing
interface ValidatedImportRow extends DrugFormValues {
  rowNumber: number;
  cleanName: string;
  cleanStrength: string | null;
  cleanDosageForm: string | null;
}

interface ImportFailure {
  rowNumber: number;
  name: string;
  error: string;
}

export class DrugService {
/**
   * Creates a new global drug entry in the system registry database.
   * Also initializes a default, localized facility inventory record for the registering facility.
   * Handles sequence custom ID generation and compound duplicate record checks.
   * * @param payload Data payload adhering to the DrugFormValues definition
   * @param userId The ID of the authenticated user performing this addition
   * @param facilityId The ID of the current facility where this inventory stock is localized
   * @param ipAddress Optional IP trace
   */

/**
   * Creates a new global drug entry in the system registry database.
   * Note: This registers the drug in the catalog only; inventory 
   * must be initialized via createDrugBatch.
   */
  static async createDrug(
    payload: DrugFormValues, 
    userId: string, 
    facilityId: string, 
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      // 1. Zod runtime data payload parsing validation
      const validation = drugFormSchema.safeParse(payload);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: validation.error.errors[0]?.message || "Validation failure.",
        } as AppResponse;
      }

      const validatedData = validation.data;

      // 2. Enforce structural duplicate checking based on the compound index
      const uniqueTarget = {
        name: validatedData.name.trim(),
        strength: validatedData.strength?.trim() || undefined, 
        dosageForm: validatedData.dosageForm || undefined,
      };

      const existingDrug = await prisma.drug.findFirst({
        where: {
          name: { equals: validatedData.name.trim(), mode: 'insensitive' },
          strength: validatedData.strength?.trim() || null,
          dosageForm: validatedData.dosageForm || null,
        },
      });

      if (existingDrug) {
        return {
          success: false,
          status: 409,
          error: `A drug variant named "${validatedData.name.trim()}" with strength "${validatedData.strength?.trim() ?? 'N/A'}" and dosage form "${validatedData.dosageForm ?? 'N/A'}" already exists in the system registry.`,
        } as AppResponse;
      }

      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);

      // 3. Run creation transaction block
      const newDrug = await prisma.$transaction(async (tx) => {
        
        // Generate unique customId sequence
        const customDrugId = await generateNextCustomId({
          tx,
          facilityId: facilityId, 
          sequenceType: "DRUG",
          prefix: "DRG",
        });

        // Create the core drug row ONLY (No nested inventory creation)
        const drug = await tx.drug.create({
          data: {
            customId: customDrugId,
            name: uniqueTarget.name,
            genericName: validatedData.genericName?.trim() || null,
            strength: uniqueTarget.strength,
            unit: validatedData.unit,
            dosageForm: uniqueTarget.dosageForm,
            description: validatedData.description?.trim() || null,
            isControlled: validatedData.isControlled,
            categoryId: validatedData.categoryId?.trim() === "" ? null : validatedData.categoryId,
            isActive: validatedData.isActive,
          },
          include: {
            category: true,
          }
        });

        // 4. Document Audit Log
        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: facilityId, 
            action: AuditAction.INVENTORY_CREATED,
            entityType: AuditEntity.DRUG,
            entityId: drug.id,
            ipAddress: ipAddress || null,
            details: {
              message: "New pharmaceutical formulation asset successfully registered in the catalog.",
              customId: drug.customId,
              name: drug.name,
              strength: drug.strength,
              dosageForm: drug.dosageForm,
              unitPack: drug.unit,
              isControlled: drug.isControlled,
            },
          },
        });

        // 5. Notify
        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
        } else {   
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "New Drug Catalog Entry",
              `New item registered in catalog: ${drug.name} (${drug.strength || 'N/A'}). You can now add inventory batches for this item.`,
               NotificationType.INVENTORY, 
               recipientIds
            );
        }

        return drug;
      });

      return {
        success: true,
        status: 201,
        message: "Pharmaceutical drug asset successfully registered to the catalog.",
        data: newDrug,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Create-Drug Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database transaction failure during formulation mapping.",
      } as AppResponse;
    }
  }
 
/**
   * Updates an existing drug registry asset.
   * Modifies both the core global drug metadata and the local facility's inventory specifications (minStockLevel, manufacturer).
   * Performs proactive structural conflict verification checks if unique keys are modified.
   * * @param id The internal CUID database ID of the drug record to update
   * @param payload Data payload adhering to the UpdateDrugFormValues definition
   * @param userId The ID of the authenticated user performing this modification
   * @param facilityId The ID of the current facility where this inventory stock is localized
   * @param ipAddress Optional IP trace
   */
static async updateDrug(
    id: string, 
    payload: UpdateDrugFormValues, 
    userId: string, 
    facilityId: string, 
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      // 1. Zod runtime input schema validation check
      const validation = updateDrugFormSchema.safeParse(payload);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: validation.error.errors[0]?.message || "Validation failure.",
        } as AppResponse;
      }

      const validatedData = validation.data;
      const cleanName = validatedData.name.trim();
      const cleanStrength = validatedData.strength?.trim() || null;
      const cleanDosageForm = validatedData.dosageForm || null;

      // 2. Fetch target drug instance to verify existence
      const currentDrug = await prisma.drug.findUnique({
        where: { id }
      });

      if (!currentDrug) {
        return {
          success: false,
          status: 404,
          error: "The targeted drug record could not be located for modification.",
        } as AppResponse;
      }

      // 3. Proactive Unique Compound Index Conflict Checking
      const hasCompoundKeyShifted =
        currentDrug.name.toLowerCase() !== cleanName.toLowerCase() ||
        currentDrug.strength !== cleanStrength ||
        currentDrug.dosageForm !== cleanDosageForm;

      if (hasCompoundKeyShifted) {
        const structuralConflict = await prisma.drug.findFirst({
          where: {
            id: { not: id },
            name: { equals: cleanName, mode: "insensitive" },
            strength: cleanStrength,
            dosageForm: cleanDosageForm,
          },
        });

        if (structuralConflict) {
          return {
            success: false,
            status: 409,
            error: `Cannot update. Another drug entry named "${cleanName}" with strength "${cleanStrength ?? "N/A"}" and dosage form "${cleanDosageForm ?? "N/A"}" already occupies this registration slot.`,
          } as AppResponse;
        }
      }

      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);

      // 4. Execute atomic database records updates
      const updatedDrug = await prisma.$transaction(async (tx) => {
        
        // Step A: Update the base global drug registry details
        const drug = await tx.drug.update({
          where: { id },
          data: {
            name: cleanName,
            genericName: validatedData.genericName?.trim() || null,
            strength: cleanStrength,
            unit: validatedData.unit,
            dosageForm: cleanDosageForm,
            description: validatedData.description?.trim() || null,
            isControlled: validatedData.isControlled,
            categoryId: validatedData.categoryId?.trim() === "" ? null : validatedData.categoryId,
            isActive: validatedData.isActive,
          }
        });

        // Re-fetch updated drug to return to user
        const finalDrugPayload = await tx.drug.findUniqueOrThrow({
          where: { id },
          include: {
            category: true,
          }
        });

        // 5. Document transaction write traces natively to system AuditLog
        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: facilityId, 
            action: AuditAction.DRUG_UPDATED, 
            entityType: AuditEntity.DRUG,
            entityId: drug.id,
            ipAddress: ipAddress || null,
            details: {
              message: "Pharmaceutical specification asset details successfully modified.",
              customId: drug.customId,
              previousState: {
                name: currentDrug.name,
                strength: currentDrug.strength,
                dosageForm: currentDrug.dosageForm,
                isActive: currentDrug.isActive,
              },
              newState: {
                name: finalDrugPayload.name,
                strength: finalDrugPayload.strength,
                dosageForm: finalDrugPayload.dosageForm,
                isActive: finalDrugPayload.isActive,
              },
            },
          },
        });

        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
        } else {            
            // --- TRANSACTIONAL NOTIFICATION ---
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "Drug Specification Updated",
              `The profile for "${drug.name}" has been updated.`,
              NotificationType.INVENTORY, // Keep as INVENTORY if it's the standard category or update to DRUG_MANAGEMENT if needed
              recipientIds
            );
        }

        return finalDrugPayload;
      });

      return {
        success: true,
        status: 200,
        message: "Pharmaceutical drug parameters updated successfully.",
        data: updatedDrug,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Update-Drug Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database service update pipeline execution crash.",
      } as AppResponse;
    }
  }

  static async fetchAllDrugs(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    isDeleted: boolean;
    facilityId?: string; 
  }): Promise<AppResponse> {
    try {
      const page = Math.max(1, params.page || 1);
      const limit = Math.max(1, Math.min(100, params.limit || 10));
      const skip = (page - 1) * limit;

      const whereClause: Prisma.DrugWhereInput = {};

      if (typeof params.isDeleted === "boolean") {
        whereClause.isDeleted = params.isDeleted === true;
      }
      if (typeof params.isActive === "boolean") {
        whereClause.isActive = params.isActive;
      }
      if (params.categoryId) {
        whereClause.categoryId = params.categoryId;
      }
      if (params.search) {
        const cleanSearch = params.search.trim();
        whereClause.OR = [
          { name: { contains: cleanSearch, mode: "insensitive" } },
          { genericName: { contains: cleanSearch, mode: "insensitive" } },
          { customId: { contains: cleanSearch, mode: "insensitive" } },
        ];
      }

      const [drugs, totalCount] = await Promise.all([
        prisma.drug.findMany({
          where: whereClause,
          include: {
            category: {
              select: { id: true, name: true },
            },
            inventories: {
              where: {
                isActive: true,
                // If a facilityId is provided, you can ensure it's prioritized 
                // or fetched cleanly. If you need peer data too, make sure 
                // your frontend column cell matches the facilityId correctly.
                ...(params.facilityId ? { facilityId: params.facilityId } : {}),
              },
              include: {
                facility: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            },
          },
          orderBy: { name: "asc" },
          skip,
          take: limit,
        }),
        prisma.drug.count({ where: whereClause }),
      ]);

      const responsePayload = { drugs };

      return {
        success: true,
        status: 200,
        message: "Global drug registry and multi-facility inventory balances retrieved.",
        data: responsePayload,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Fetch-All-Drugs Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database service execution crash.",
      } as AppResponse;
    }
  }
/**
   * Performs a structured soft-delete operation by shifting the target 
   * drug asset status flag to inactive. Also deactivates all associated facility
   * inventory records. Safeguards system transactions by checking for active stock
   * dependencies beforehand.
   * * @param id The internal CUID database ID of the drug record to soft delete
   * @param userId The ID of the authenticated user performing this action
   * @param facilityId The ID of the current facility initiating the delete
   * @param ipAddress Client IP address network tracking parameter for audit trail compliance
   */
  static async deleteDrug(
    id: string, 
    userId: string, 
    facilityId: string, 
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      if (!id) {
        return {
          success: false,
          status: 400,
          error: "Targeted drug context identity indicator is required.",
        } as AppResponse;
      }

      // 1. Fetch target registry profile information and operational linkages
      const drug = await prisma.drug.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              inventories: {
                where: {
                  isActive: true,
                  isDeleted: false,
                  availableQuantity: { gt: 0 }, // Identifies non-zero live inventory states
                },
              },
            },
          },
        },
      });

      if (!drug) {
        return {
          success: false,
          status: 404,
          error: "The targeted drug record could not be located in the asset registry.",
        } as AppResponse;
      }

      // 2. Already soft-deleted verification catch
      if (!drug.isActive) {
        return {
          success: true,
          status: 200,
          message: `The pharmaceutical asset "${drug.name}" is already marked inactive within the registry database.`,
        } as AppResponse;
      }

      // 3. Multi-tenant inventory shield safety guard check
      // Prevents disabling a pharmaceutical asset if facilities are holding active stocks
      if (drug._count.inventories > 0) {
        return {
          success: false,
          status: 422,
          error: `Soft-delete aborted: "${drug.name}" has active inventory quantities across one or more facilities. Zero out active batches before archiving.`,
        } as AppResponse;
      }

       const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);

      // 4. Execute atomic transaction block: Apply state mutation flags and write historical logs
      const archivedDrug = await prisma.$transaction(async (tx) => {
        // Step A: Mark the main drug specification record as inactive
        const updated = await tx.drug.update({
          where: { id },
          data: {
            isActive: false, 
            isDeleted:true,
            isDeletedAt: new Date(),
            deletedBy: userId 
          },
        });

        // Step B: Cascaded deactivate: Mark all associated inventory records as inactive as well
        await tx.inventory.updateMany({
          where: { drugId: id },
          data: { isActive: false }
        });

        // 5. Build system audit trail metadata payload containing IP parameters
        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: facilityId, 
            action: AuditAction.INVENTORY_UPDATED, 
            entityType: AuditEntity.DRUG,
            entityId: updated.id,
            ipAddress: ipAddress || null,
            details: {
              message: "Pharmaceutical specification asset and its facility inventories soft-deleted and archived from active selections.",
              customId: updated.customId,
              name: updated.name,
              strength: updated.strength,
              dosageForm: updated.dosageForm,
              archivedByUserId: userId,
            },
          },
        });

        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {            
            // --- TRANSACTIONAL NOTIFICATION ---
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "Drug Registry Archive",
              `The pharmaceutical asset "${updated.name}" has been deactivated and removed from active inventory.`,
              NotificationType.INVENTORY,
              recipientIds
            );
          }

        return updated;
      });

      return {
        success: true,
        status: 200,
        message: `Pharmaceutical asset "${archivedDrug.name}" successfully soft-deleted and archived from the active registry.`,
        data: archivedDrug,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Soft-Delete-Drug Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database pipeline soft-delete compilation or execution crash.",
      } as AppResponse;
    } 
  }


 /**
   * Re-enables a previously soft-deleted drug formulation asset back into active rotation.
   * Also cascades activation down to related localized facility inventory records.
   * Validates safety parameters to ensure re-enabling does not conflict with active variants.
   * * @param id The internal CUID database ID of the drug record to restore
   * @param userId The ID of the authenticated user performing this action
   * @param facilityId The ID of the current facility initiating the restore
   * @param ipAddress Client IP address network tracking parameter for audit trail compliance
   */
  static async restoreDrug(
    id: string, 
    userId: string, 
    facilityId: string, 
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      if (!id) {
        return {
          success: false,
          status: 400,
          error: "Targeted drug context identity indicator is required.",
        } as AppResponse;
      }

      // 1. Fetch target registry profile information
      const drug = await prisma.drug.findUnique({
        where: { id },
      });

      if (!drug) {
        return {
          success: false,
          status: 404,
          error: "The targeted drug record could not be located in the asset registry.",
        } as AppResponse;
      }

      // 2. Already active validation catch
      if (drug.isActive && !drug.isDeleted) {
        return {
          success: true,
          status: 200,
          message: `The pharmaceutical asset "${drug.name}" is already active within the registry database.`,
        } as AppResponse;
      }

      // 3. Prevent Compound Unique Index Conflicts upon restoration
      // Check if an active drug now exists with the exact same configuration keys
      const activeConflict = await prisma.drug.findFirst({
        where: {
          id: { not: id },
          name: { equals: drug.name, mode: "insensitive" },
          strength: drug.strength,
          dosageForm: drug.dosageForm,
          isActive: true, // Only flags a conflict if the duplicate is actively running
        },
      });

      if (activeConflict) {
        return {
          success: false,
          status: 409,
          error: `Restoration rejected: An active drug formulation matching "${drug.name}" (${drug.strength ?? "N/A"} - ${drug.dosageForm ?? "N/A"}) has been registered since this asset was archived.`,
        } as AppResponse;
      }

             const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
              UserRole.ADMIN,
              UserRole.PHARMACIST,
              UserRole.STAFF,
              UserRole.VIEWER,
            ], userId);
      // 4. Execute atomic transaction block: Reactivate drug, reactivate inventories, and write audit metrics
      const restoredDrug = await prisma.$transaction(async (tx) => {
        // Step A: Mark the main drug specification record as active
        const updated = await tx.drug.update({
          where: { id },
          data: { isActive: true, isDeleted: false },
        });

        // Step B: Cascade activation back down to related inventory rows
        await tx.inventory.updateMany({
          where: { drugId: id },
          data: { isActive: true }
        });

        // 5. Document trace metadata inside system AuditLog
        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: facilityId, 
            action: AuditAction.INVENTORY_UPDATED, 
            entityType: AuditEntity.DRUG,
            entityId: updated.id,
            ipAddress: ipAddress || null,
            details: {
              message: "Pharmaceutical specification asset and its facility inventories successfully restored and reactivated.",
              customId: updated.customId,
              name: updated.name,
              strength: updated.strength,
              dosageForm: updated.dosageForm,
              restoredByUserId: userId,
            },
          },
        });

        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {            
            // --- TRANSACTIONAL NOTIFICATION ---
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "Drug Registry Restoration",
              `The pharmaceutical asset "${updated.name}" has been restored to active status and is now available for inventory operations.`,
              NotificationType.INVENTORY,
              recipientIds
            );
          }

        return updated;
      });

      return {
        success: true,
        status: 200,
        message: `Pharmaceutical asset "${restoredDrug.name}" has been successfully restored and reactivated.`,
        data: restoredDrug,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Restore-Drug Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database pipeline restore pipeline execution crash.",
      } as AppResponse;
    }
  }


 /**
   * Bulk imports an array of pharmaceutical assets into the global registry.
   * Also atomically initializes corresponding facility inventory tracking records.
   * Fully type-safe implementation completely avoiding the 'any' keyword.
   * * @param inputs Array of raw drug payloads adhering to DrugFormValues definition
   * @param userId The ID of the authenticated user executing the import operation
   * @param facilityId The ID of the current facility where these stocks are registered
   * @param ipAddress Client IP address tracking parameter
   */
  static async bulkImportDrugs(
    inputs: DrugFormValues[], 
    userId: string, 
    facilityId: string, 
    ipAddress: string
  ): Promise<AppResponse> {
    try {
      if (!inputs || inputs.length === 0) {
        return {
          success: false,
          status: 400,
          error: "Invalid payload wrapper: Input array must contain at least one drug record entry.",
        } as AppResponse;
      }

      const passedRows: ValidatedImportRow[] = [];
      const failedRows: ImportFailure[] = [];

      // 1. Phase One: Parse through schemas and catch runtime structural anomalies
      for (let i = 0; i < inputs.length; i++) {
        const rowNum = i + 1;
        const rawInput = inputs[i];

        const validation = drugFormSchema.safeParse(rawInput);
        if (!validation.success) {
          failedRows.push({
            rowNumber: rowNum,
            name: rawInput?.name || "Unknown Identity Spec",
            error: validation.error.errors[0]?.message || "Schema compilation error.",
          });
          continue;
        }

        passedRows.push({
          ...validation.data,
          rowNumber: rowNum,
          cleanName: validation.data.name.trim(),
          cleanStrength: validation.data.strength?.trim() || null,
          cleanDosageForm: validation.data.dosageForm || null,
        });
      }

      if (passedRows.length === 0) {
        return {
          success: false,
          status: 422,
          error: "Bulk processing aborted: All provided rows failed runtime validation parameters.",
          meta: { failedRows },
        } as AppResponse;
      }

      // 2. Phase Two: Batch query using the 'in' list operator to locate active duplicates
      const namesToQuery = passedRows.map((r) => r.cleanName);
      
      const existingDrugsInDB = await prisma.drug.findMany({
        where: {
          name: { in: namesToQuery, mode: "insensitive" }
        },
        select: { name: true, strength: true, dosageForm: true }
      });

      // Local tracking set to avoid duplicate constraint collisions across the payload rows themselves
      const localUniqueRegistry = new Set<string>();
      const finalImportQueue: ValidatedImportRow[] = [];

      for (const row of passedRows) {
        const uniqueStringKey = `${row.cleanName.toLowerCase()}|${row.cleanStrength?.toLowerCase() || ""}|${row.cleanDosageForm || ""}`;

        // Check if row matches an entity already in the database
        const conflictsWithDB = existingDrugsInDB.some((dbDrug) => 
          dbDrug.name.toLowerCase() === row.cleanName.toLowerCase() &&
          (dbDrug.strength || null) === row.cleanStrength &&
          (dbDrug.dosageForm || null) === row.cleanDosageForm
        );

        if (conflictsWithDB) {
          failedRows.push({
            rowNumber: row.rowNumber,
            name: row.name,
            error: "A drug with this name, strength, and dosage form combo already exists in the database.",
          });
          continue;
        }

        // Check if row conflicts with another row within the same incoming batch payload
        if (localUniqueRegistry.has(uniqueStringKey)) {
          failedRows.push({
            rowNumber: row.rowNumber,
            name: row.name,
            error: "Duplicate item collision: This row matches a prior row entry within the same import payload.",
          });
          continue;
        }

        localUniqueRegistry.add(uniqueStringKey);
        finalImportQueue.push(row);
      }

      if (finalImportQueue.length === 0) {
        return {
          success: false,
          status: 409,
          error: "All valid rows conflicted with existing database registry parameters or inner files.",
          meta: { failedRows },
        } as AppResponse;
      }

      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);

      // 3. Phase Three: Execute atomic transaction block for writing rows cleanly
      const transactionResult = await prisma.$transaction(async (tx) => {
        const insertedDrugs: Drug[] = [];

        for (const drugData of finalImportQueue) {
          const customDrugId = await generateNextCustomId({
            tx,
            facilityId: facilityId,
            sequenceType: "DRUG",
            prefix: "DRG",
          });

          const created = await tx.drug.create({
            data: {
              customId: customDrugId,
              name: drugData.cleanName,
              genericName: drugData.genericName?.trim() || null,
              strength: drugData.cleanStrength,
              unit: drugData.unit,
              dosageForm: drugData.cleanDosageForm as DosageForm, 
              isControlled: drugData.isControlled,
              categoryId: drugData.categoryId?.trim() === "" ? null : drugData.categoryId,
              isActive: drugData.isActive,
              description: drugData.description?.trim() || null,
            },
          });

          insertedDrugs.push(created);
        }

        // 4. Commit system audit line
        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: facilityId,
            action: AuditAction.DRUG_CREATED, // Updated to reflect entity creation
            ipAddress: ipAddress || null,
            entityType: AuditEntity.DRUG,
            entityId: "BULK_IMPORT",
            details: {
              message: "Pharmaceutical specification registry bulk import completed.",
              totalPassedRowsInserted: insertedDrugs.length,
              totalFailedRowsRejected: failedRows.length,
              importedByUserId: userId,
            },
          },
        });

        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
        } else {            
            if (insertedDrugs.length > 0) {
              const failureNote = failedRows.length > 0 
                ? ` Note: ${failedRows.length} rows were skipped due to validation or conflict errors.` 
                : "";
              await NotificationService.createNotificationInTx(
                tx,
                facilityId,
                "Bulk Import Completed",
                `Successfully imported ${insertedDrugs.length} new pharmaceutical assets into the registry.${failureNote}`,
                NotificationType.INVENTORY,
                recipientIds
              );
            }
        }

        return insertedDrugs;
      });

      return {
        success: true,
        status: 201,
        message: `Bulk processing completed. Successfully imported ${transactionResult.length} assets. Rejected ${failedRows.length} lines.`,
        data: {
          insertedCount: transactionResult.length,
          rejectedCount: failedRows.length,
        },
        meta: failedRows.length > 0 ? { failures: failedRows.sort((a, b) => a.rowNumber - b.rowNumber) } : undefined,
      };

    } catch (error) {
      console.error("🚨 Critical System Level Bulk-Import-Drug Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database batch insert execution pipeline crash.",
      };
    }
  }

}