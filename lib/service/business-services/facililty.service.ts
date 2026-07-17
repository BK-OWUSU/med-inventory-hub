
import { AppResponse } from "@/types/types/app.type";
import { generateNextCustomId } from "@/lib/utils";
import { AuditAction, AuditEntity, NotificationType, UserRole } from "@/generated/prisma/browser"; // Adjust to your audit enum location
import { CreateFacilityInput, CreateFacilitySchema, UpdateFacilityInput, UpdateFacilitySchema } from "@/types/schemas/facility.schema";
import { prisma } from "@/lib/database/dbConnection";
import { FacilityFilters } from "@/types/types/facility.type";
import { Prisma } from "@/generated/prisma/client";
import { sendTempPasswordEmail } from "@/lib/mailer/email";
import { randomBytes } from "crypto";
import { hashPassword } from "@/lib/auths/auths-functions";
import { NotificationService } from "./notification.service";

export class FacilityService {
  /**
   * Registers a new facility in the system.
   * Performs uniqueness checks on Custom ID and License Number, 
   * creates the facility record, and logs the action for security audit.
   * 
   * @param payload Structurally parsed data conforming to CreateFacilityInput
   * @param userId The ID of the authenticated user
   * @param ipAddress Optional IP trace
   */
  static async createFacility(
  payload: CreateFacilityInput,
  userId: string,
  facilityId: string, 
  ipAddress?: string,
  userAgent?: string,
): Promise<AppResponse> {
  try {
    const validation = CreateFacilitySchema.safeParse(payload);
    if (!validation.success) {
      return {
        success: false,
        status: 400,
        error: validation.error.errors[0]?.message || "Invalid facility payload.",
      } as AppResponse;
    }

    const validatedData = validation.data;
    const cleanLicense = validatedData.licenseNumber?.trim().toUpperCase();
    const cleanAdminEmail = validatedData.adminEmail.trim().toLowerCase();

    // 1. Prevent constraint violations
    const existingFacility = await prisma.facility.findFirst({
      where: { licenseNumber: cleanLicense },
    });

    if (existingFacility) {
      return {
        success: false,
        status: 409,
        error: "A facility with this License Number already exists.",
      } as AppResponse;
    }

    // 2. Prepare Security Data
    const tempPassword = randomBytes(6).toString("hex");
    const hashedPassword = await hashPassword(tempPassword);

 
      const recipientIdUser = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.SUPER_ADMIN,
      ], userId);   
      
      const recipientIdsFacility = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
      ], userId);

    const {facility, admin} =  await prisma.$transaction(async (tx) => {
      // A. Generate Facility ID
      const customFacilityId = await generateNextCustomId({
        tx,
        facilityId: facilityId,
        sequenceType: "FACILITY_ID",
        prefix: "FAC",
      });

      // B. Create Facility
      const facility = await tx.facility.create({
        data: {
          customId: customFacilityId,
          name: validatedData.name.trim(),
          type: validatedData.type,
          location: validatedData.location.trim(),
          address: validatedData.address?.trim() || null,
          phone: validatedData.phone?.trim() || null,
          email: validatedData.email?.trim() || null,
          licenseNumber: cleanLicense,
          imageUrl: validatedData.imageUrl,
          isActive: validatedData.isActive,
          isVerified: validatedData.isVerified,
        },
      });

      // C. Generate User ID for Admin
      const customUserId = await generateNextCustomId({
        tx,
        facilityId: facility.id, // Using the new facility's ID
        sequenceType: "USER_ID",
        prefix: "USR",
      });

      // D. Create Initial Admin
      const admin = await tx.user.create({
        data: {
          customId: customUserId,
          email: cleanAdminEmail,
          password: hashedPassword,
          fullName: validatedData.fullName.trim(),
          role: validatedData.role, // e.g., UserRole.ADMIN
          facilityId: facility.id,
          isActive: true,
          needsPasswordChange: true,
        },
      });

      // E. Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          facilityId: facilityId,
          action: AuditAction.FACILITY_CREATED,
          entityType: AuditEntity.FACILITY,
          entityId: facility.id,
          userAgent,
          ipAddress,
          details: {
            message: "New facility and initial admin created.",
            facilityName: facility.name,
            adminEmail: admin.email,
          },
        },
      });


      if (recipientIdsFacility.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {            
            await NotificationService.createNotificationInTx(
              tx,
              facility.id,
              "New Facility Registered",
              `A new facility "${facility.name}" has been successfully registered.`,
              NotificationType.FACILITY,
              recipientIdsFacility
            );
          }


          if (recipientIdUser.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {            
            // 2. Notify about the new Admin account
            await NotificationService.createNotificationInTx(
              tx,
              facility.id,
              "New Admin Account Created",
              `Initial admin "${admin.fullName}" has been created for ${facility.name}.`,
              NotificationType.USER,
              recipientIdUser
            );
          }




      return { facility, admin };
    });

    // 4. Dispatch Email AFTER Transaction
    try {
      await sendTempPasswordEmail(
        admin.email,
        admin.email,
        tempPassword,
        admin.fullName,
        facility.name
      );
    } catch (mailError) {
      console.error("⚠️ Mailer Error (Facility created, email failed):", mailError);
    }

    return {
      success: true,
      status: 201,
      message: `Facility "${facility.name}" and admin account created successfully.`,
      data: facility,
    } as AppResponse;

  } catch (error) {
    console.error("🚨 Critical System Level Create-Facility Service Error:", error);
    return {
      success: false,
      status: 500,
      error: "Internal failure occurred while processing facility registration.",
    } as AppResponse;
  }
}

  /**
   * Updates an existing healthcare facility.
   * Performs existence checks, validates uniqueness for restricted fields,
   * updates the record, and logs the change in the AuditLog.
   * 
   * @param id The unique identifier of the facility to update
   * @param payload Structurally parsed data conforming to UpdateFacilityInput
   * @param userId The ID of the authenticated user performing the update
   * @param ipAddress Optional IP trace
   * @param userAgent Optional user agent trace
   */
  static async updateFacility(
    id: string,
    payload: UpdateFacilityInput,
    userId: string,
    facilityId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      // 1. Structural runtime validation
      const validation = UpdateFacilitySchema.safeParse({ ...payload, id });
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: validation.error.errors[0]?.message || "Invalid update payload.",
        } as AppResponse;
      }

      const validatedData = validation.data;

      // 2. Check if facility exists
      const existingFacility = await prisma.facility.findUnique({
        where: { id: validatedData.id },
      });

      if (!existingFacility) {
        return {
          success: false,
          status: 404,
          error: "Facility not found.",
        } as AppResponse;
      }

      // 3. Prevent uniqueness constraint violations if changing restricted fields
      if (validatedData.licenseNumber || validatedData.customId) {
        const duplicate = await prisma.facility.findFirst({
          where: {
            id: { not: validatedData.id },
            OR: [
              { customId: validatedData.customId },
              { licenseNumber: validatedData.licenseNumber },
            ],
          },
        });

        if (duplicate) {
          return {
            success: false,
            status: 409,
            error: "Another facility is already using this Custom ID or License Number.",
          } as AppResponse;
        }
      }

      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
      ], userId);

      // 4. Atomic transaction
      const result = await prisma.$transaction(async (tx) => {
        // A. Update the facility
        const updatedFacility = await tx.facility.update({
          where: { id: validatedData.id },
          data: {
            ...validatedData, // Handles partial updates automatically
            id: undefined,    // Ensure ID isn't modified
          },
        });

        // B. Log to audit trail
        await tx.auditLog.create({
          data: {
            userId,
            facilityId: facilityId,
            action: AuditAction.FACILITY_UPDATED,
            entityType: AuditEntity.FACILITY,
            entityId: updatedFacility.id,
            ipAddress: ipAddress || null,
            details: {
              message: "Facility details updated.",
              changes: validatedData, // Captures fields sent in the request
              userAgent: userAgent || null,
            },
          },
        });


        
        
        // B. Notification: Facility Verification Status Change
        if (validatedData.isVerified !== undefined && validatedData.isVerified !== existingFacility.isVerified) {
        if (recipientIds.length === 0) {
              console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
              // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
            } else {              
              await NotificationService.createNotificationInTx(
                tx,
                updatedFacility.id,
                validatedData.isVerified ? "Facility Verified" : "Facility Unverified",
                `Facility "${updatedFacility.name}" has been successfully ${validatedData.isVerified ? "verified" : "unverified"}.`,
                NotificationType.FACILITY,
                recipientIds
              );
            }
      }

      // C. Notification: Facility Activation Status Change
      if (validatedData.isActive !== undefined && validatedData.isActive !== existingFacility.isActive) {
        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {
            await NotificationService.createNotificationInTx(
              tx,
              updatedFacility.id,
              validatedData.isActive ? "Facility Enabled" : "Facility Disabled",
              `Facility "${updatedFacility.name}" has been ${validatedData.isActive ? "enabled" : "disabled"}.`,
              NotificationType.FACILITY,
              recipientIds
            );
            
          }
      }

        return updatedFacility;
      });

      return {
        success: true,
        status: 200,
        message: `Facility "${result.name}" updated successfully.`,
        data: result,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Update-Facility Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal failure occurred while updating facility details.",
      } as AppResponse;
    }
  }


  static async verifyFacility(
    id: string,
    userId: string,
    facilityId: string, // Context for the audit log
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      // 1. Check if facility exists
      const existingFacility = await prisma.facility.findUnique({
        where: { id },
      });

      if (!existingFacility) {
        return {
          success: false,
          status: 404,
          error: "Facility not found.",
        } as AppResponse;
      }

      if (existingFacility.isVerified) {
        return {
          success: false,
          status: 400,
          error: "Facility is already verified.",
        } as AppResponse;
      }

        const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
      ], userId);
      // 2. Atomic transaction
      const result = await prisma.$transaction(async (tx) => {
        // A. Update the verification status
        const updatedFacility = await tx.facility.update({
          where: { id },
          data: {
            isVerified: true,
          },
        });

        // B. Log to audit trail
        await tx.auditLog.create({
          data: {
            userId,
            facilityId: facilityId,
            action: AuditAction.FACILITY_VERIFIED,
            entityType: AuditEntity.FACILITY,
            entityId: updatedFacility.id,
            ipAddress: ipAddress || null,
            details: {
              message: "Facility verification status updated to true.",
              previousStatus: false,
              newStatus: true,
              userAgent: userAgent || null,
            },
          },
        });



        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {            
            // C. Notification
          await NotificationService.createNotificationInTx(
            tx,
            id, // Target facility ID
            "Facility Verified",
            `Facility "${updatedFacility.name}" has been successfully verified.`,
            NotificationType.FACILITY,
            recipientIds
          );
          }



        return updatedFacility;
      });

      return {
        success: true,
        status: 200,
        message: `Facility "${result.name}" has been verified successfully.`,
        data: result,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Verify-Facility Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal failure occurred while verifying facility.",
      } as AppResponse;
    }
  }

  /**
   * Fetches a paginated list of facilities with optional filters.
   * meta is returned at the top level of the AppResponse.
   */
  static async fetchFacilities(filters?: FacilityFilters): Promise<AppResponse> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      // 1. Build dynamic where clause
      const where: Prisma.FacilityWhereInput = {
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { customId: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.isVerified !== undefined && { isVerified: filters.isVerified }),
        ...((filters?.startDate || filters?.endDate) && {
          createdAt: {
            ...(filters.startDate && { gte: new Date(filters.startDate) }),
            ...(filters.endDate && { lte: new Date(filters.endDate) }),
          },
        }),
      };

      // 2. Fetch data and count in parallel
      const [facilities, total] = await Promise.all([
        prisma.facility.findMany({
          where,
          include: {
            _count: {
              select: { inventories: true, users: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.facility.count({ where }),
      ]);

      return {
        success: true,
        status: 200,
        data: facilities, // Data is just the array
        meta: {           // Meta is separate at the top level
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Fetch-Facilities Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal failure occurred while retrieving facilities.",
      } as AppResponse;
    }
  }

}