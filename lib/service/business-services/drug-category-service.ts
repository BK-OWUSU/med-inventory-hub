import { AuditAction, AuditEntity, NotificationType, UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/database/dbConnection";
import { DrugCategoryFormValues, drugCategorySchema, UpdateDrugCategoryFormValues } from "@/types/schemas/drug.schema";
import { AppResponse } from "@/types/types/app.type";
import { NotificationService } from "./notification.service";
import { Receipt } from "lucide-react";

export class DrugCategoryService {
  /**
   * Creates a new pharmaceutical drug category entry.
   * Handles duplication checks based on unique category name (case-insensitive).
   * Documents the creation with a native system AuditLog.
   * * @param payload Data payload adhering to the DrugCategoryFormValues definition
   * @param userId The ID of the authenticated user performing this addition
   * @param facilityId The ID of the current facility where the user is logged in
   * @param ipAddress Optional IP trace
   */
  static async createCategory(
    payload: DrugCategoryFormValues,
    userId: string,
    facilityId: string,
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      // 1. Zod runtime data payload parsing validation
      const validation = drugCategorySchema.safeParse(payload);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: validation.error.errors[0]?.message || "Validation failure.",
        } as AppResponse;
      }

      const validatedData = validation.data;
      const trimmedName = validatedData.name.trim();

      // 2. Enforce structural duplicate checking based on unique name
      // model DrugCategory { ... name String @unique ... }
      const existingCategory = await prisma.drugCategory.findFirst({
        where: {
          name: { equals: trimmedName, mode: "insensitive" },
        },
      });

      if (existingCategory) {
        return {
          success: false,
          status: 409,
          error: `A drug category named "${trimmedName}" already exists in the system registry.`,
        } as AppResponse;
      }

       const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);

      // 3. Run creation transaction block to ensure audit log and creation are atomic
      const newCategory = await prisma.$transaction(async (tx) => {
        // Create the core drug category row
        const category = await tx.drugCategory.create({
          data: {
            name: trimmedName,
            description: validatedData.description?.trim() || null,
            isActive: validatedData.isActive,
          },
        });

        // 4. Document transaction write trace parameters natively to system AuditLog
        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: facilityId,
            action: AuditAction.INVENTORY_CREATED, // Closest matching AuditAction enum
            entityType: AuditEntity.DRUG, // Related to Drug infrastructure
            entityId: category.id,
            ipAddress: ipAddress || null,
            details: {
              message: "New pharmaceutical category successfully registered in system registry.",
              categoryName: category.name,
              categoryDescription: category.description,
              isActive: category.isActive,
            },
          },
        });

        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {            
            // 3. Notification
          await NotificationService.createNotificationInTx(
            tx,
            facilityId,
            "New Category Created",
            `A new pharmaceutical category "${category.name}" has been registered.`,
            NotificationType.INVENTORY,
            recipientIds
          );
          }


        return category;
      });

      return {
        success: true,
        status: 201,
        message: `Pharmaceutical category "${newCategory.name}" successfully registered.`,
        data: newCategory,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Create-DrugCategory Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database service database transaction failure during category registration.",
      } as AppResponse;
    }
  }

  /**
   * Updates an existing drug category.
   * Handles case-insensitive duplicate checking for name changes.
   * Records changes with a detailed audit log comparing old and new states.
   * @param id The unique ID of the category to update
   * @param payload Data payload adhering to the UpdateDrugCategoryFormValues definition
   * @param userId The ID of the authenticated user performing this action
   * @param facilityId The ID of the current facility where the user is logged in
   * @param ipAddress Optional IP trace
   */
  static async updateCategory(
    id: string,
    payload: UpdateDrugCategoryFormValues,
    userId: string,
    facilityId: string,
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      // 1. Zod runtime validation
      const validation = drugCategorySchema.safeParse(payload);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: validation.error.errors[0]?.message || "Validation failure.",
        } as AppResponse;
      }

      const validatedData = validation.data;
      const trimmedName = validatedData.name.trim();

      // 2. Locate the existing category first to track history and verify existence
      const existingCategory = await prisma.drugCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        return {
          success: false,
          status: 404,
          error: "Drug category not found or has been removed from the registry.",
        } as AppResponse;
      }

      // 3. Prevent renaming collision with another existing category
      const nameConflict = await prisma.drugCategory.findFirst({
        where: {
          name: { equals: trimmedName, mode: "insensitive" },
          id: { not: id }, // Exclude the current category being updated
        },
      });

      // KEY FIX: If any record is found here, it belongs to a completely DIFFERENT category ID using the same name.
      if (nameConflict) {
        return {
          success: false,
          status: 409,
          error: `Another drug category named "${trimmedName}" already exists.`,
        } as AppResponse;
      }

        const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.ADMIN,
        UserRole.PHARMACIST,
        UserRole.STAFF,
        UserRole.VIEWER,
      ], userId);
      // 4. Run update transaction block
      const updatedCategory = await prisma.$transaction(async (tx) => {
        const category = await tx.drugCategory.update({
          where: { id },
          data: {
            name: trimmedName,
            description: validatedData.description?.trim() || null,
            isActive: validatedData.isActive,
          },
        });

        // 5. Document action natively to AuditLog, tracking old vs new values
        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: facilityId,
            action: AuditAction.INVENTORY_UPDATED, // Standard update trace action
            entityType: AuditEntity.DRUG,
            entityId: category.id,
            ipAddress: ipAddress || null,
            details: {
              message: `Pharmaceutical category "${existingCategory.name}" was updated.`,
              previousState: {
                name: existingCategory.name,
                description: existingCategory.description,
                isActive: existingCategory.isActive,
              },
              newState: {
                name: category.name,
                description: category.description,
                isActive: category.isActive,
              },
            },
          },
        });

        // 3. Conditional Notification
      // We only notify if the name or status changed, to avoid spamming the logs
      const hasStatusChanged = validatedData.isActive !== existingCategory.isActive;
      const hasNameChanged = trimmedName !== existingCategory.name;

      if (hasStatusChanged || hasNameChanged) {
        let message = `Drug category "${category.name}" details updated.`;
        if (hasStatusChanged) {
          message = `Drug category "${category.name}" has been ${category.isActive ? 'activated' : 'deactivated'}.`;
        }

        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "Category Updated",
              message,
              NotificationType.INVENTORY,
              recipientIds
            );
          }
      }

        return category;
      });

      return {
        success: true,
        status: 200,
        message: `Pharmaceutical category "${updatedCategory.name}" successfully updated.`,
        data: updatedCategory,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Update-DrugCategory Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database transaction failure during category modifications.",
      } as AppResponse;
    }
  }



  /**
   * Fetches all registered drug categories from the database.
   * Includes an aggregate relation count of drugs assigned to each category 
   * to satisfy the frontend `DrugCategoryWithCount` TypeScript type definition.
   * * @returns AppResponse wrapping the list of drug categories
   */
  static async fetchCategories(): Promise<AppResponse> {
    try {
      // Fetch categories alongside their aggregated drug counts
      const categories = await prisma.drugCategory.findMany({
        include: {
          _count: {
            select: {
              drugs: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        success: true,
        status: 200,
        message: "Drug categories retrieved successfully.",
        data: {
          categories,
        },
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Fetch-DrugCategories Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database service failure while fetching categories.",
      } as AppResponse;
    }
  }

  /**
   * Soft-deletes a drug category by setting its isActive flag to false.
   * STRICTLY RESTRICTED if active drug formulations are currently linked to this category.
   * * @param id The unique ID of the category to soft-delete
   * @param userId The ID of the authenticated user performing this action
   * @param facilityId The ID of the current facility where the user is logged in
   * @param ipAddress Optional IP trace
   */
  static async deleteCategory(
    id: string,
    userId: string,
    facilityId: string,
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      // 1. Locate the category and fetch the count of linked drugs
      const categoryWithCount = await prisma.drugCategory.findUnique({
        where: { id },
        include: {
          _count: {
            select: { drugs: true }
          }
        }
      });

      if (!categoryWithCount) {
        return {
          success: false,
          status: 404,
          error: "Drug category not found or has already been removed.",
        } as AppResponse;
      }

      // 2. Strict Check: If drugs are registered under this category, reject the deletion!
      const linkedDrugsCount = categoryWithCount._count.drugs;
      if (linkedDrugsCount > 0) {
        return {
          success: false,
          status: 400,
          error: `Cannot deactivate category "${categoryWithCount.name}". There are ${linkedDrugsCount} drug(s) assigned to this category. Please reassign them first.`,
        } as AppResponse;
      }

      // 3. Prevent redundant updates if it is already deactivated
      if (!categoryWithCount.isActive) {
        return {
          success: false,
          status: 400,
          error: `The category "${categoryWithCount.name}" is already deactivated.`,
        } as AppResponse;
      }

      // 4. Perform atomic soft delete and write to the Audit Log
      const deactivatedCategory = await prisma.$transaction(async (tx) => {
        const category = await tx.drugCategory.update({
          where: { id },
          data: {
            isActive: false,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: facilityId,
            action: AuditAction.INVENTORY_UPDATED,
            entityType: AuditEntity.DRUG,
            entityId: category.id,
            ipAddress: ipAddress || null,
            details: {
              message: `Pharmaceutical category "${category.name}" was successfully soft-deleted after verifying no existing active drug relations.`,
              categoryName: category.name,
              previousActiveState: true,
              newActiveState: false,
            },
          },
        });

        return category;
      });

      return {
        success: true,
        status: 200,
        message: `Pharmaceutical category "${deactivatedCategory.name}" successfully deactivated.`,
        data: deactivatedCategory,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Delete-DrugCategory Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database transaction failure during category deactivation.",
      } as AppResponse;
    }
  }

  /**
   * Restores a previously soft-deleted (deactivated) drug category.
   * Ensures no name collisions occur with other active categories during restoration.
   * Logs a dedicated reactivation trace to the system AuditLog.
   * * @param id The unique ID of the category to restore
   * @param userId The ID of the authenticated user performing this action
   * @param facilityId The ID of the current facility where the user is logged in
   * @param ipAddress Optional IP trace
   */
  static async restoreCategory(
    id: string,
    userId: string,
    facilityId: string,
    ipAddress?: string
  ): Promise<AppResponse> {
    try {
      // 1. Verify that the category exists
      const existingCategory = await prisma.drugCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        return {
          success: false,
          status: 404,
          error: "Drug category not found or has been completely purged from the system registry.",
        } as AppResponse;
      }

      // 2. Prevent redundant execution if it is already active
      if (existingCategory.isActive) {
        return {
          success: false,
          status: 400,
          error: `The category "${existingCategory.name}" is already active.`,
        } as AppResponse;
      }

      // 3. Prevent collision: Check if an active category already exists with this exact name
      const nameConflict = await prisma.drugCategory.findFirst({
        where: {
          name: { equals: existingCategory.name.trim(), mode: "insensitive" },
          id: { not: id },
          isActive: true, // Only conflict with active ones
        },
      });

      if (nameConflict) {
        return {
          success: false,
          status: 409,
          error: `Cannot restore "${existingCategory.name}". Another active category already exists with this name.`,
        } as AppResponse;
      }

             const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
              UserRole.ADMIN,
              UserRole.PHARMACIST,
              UserRole.STAFF,
              UserRole.VIEWER,
            ], userId);

      // 4. Perform atomic restore and write to the Audit Log
      const restoredCategory = await prisma.$transaction(async (tx) => {
        const category = await tx.drugCategory.update({
          where: { id },
          data: {
            isActive: true,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: userId,
            facilityId: facilityId,
            action: AuditAction.INVENTORY_UPDATED,
            entityType: AuditEntity.DRUG,
            entityId: category.id,
            ipAddress: ipAddress || null,
            details: {
              message: `Pharmaceutical category "${category.name}" was successfully restored to active status.`,
              categoryName: category.name,
              previousActiveState: false,
              newActiveState: true,
            },
          },
        });

        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {      
                // Notification
              await NotificationService.createNotificationInTx(
                tx,
                facilityId,
                "Category Restored",
                `Pharmaceutical category "${category.name}" has been successfully restored to active status.`,
                NotificationType.INVENTORY,
                recipientIds
              );
          }

        return category;
      });

      return {
        success: true,
        status: 200,
        message: `Pharmaceutical category "${restoredCategory.name}" successfully restored.`,
        data: restoredCategory,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Restore-DrugCategory Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal database transaction failure during category restoration.",
      } as AppResponse;
    }
  }
}