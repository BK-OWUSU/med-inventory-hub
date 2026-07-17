
import { Prisma, User } from "@/generated/prisma/client";
import { NotificationType, UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/database/dbConnection";
import { AppResponse } from "@/types/types/app.type";
import { AppUser, AppUserList } from "@/types/types/auth.types";
import { CreateUserInput, CreateUserSchema, UpdateUserInput, UpdateUserSchema } from "@/types/schemas/user.schema";
import { AuditAction, AuditEntity } from "@/generated/prisma/browser";
import { generateNextCustomId } from "@/lib/utils";
import { sendTempPasswordEmail } from "@/lib/mailer/email";
import { randomBytes } from "crypto";
import { hashPassword } from "@/lib/auths/auths-functions";
import { NotificationService } from "../business-services/notification.service";

export class UserService {
  /**
   * Fetches a paginated, filterable, and searchable list of system users.
   * * @param params Filter criteria configuration parameters
   */
  static async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    facilityId?: string; // Crucial for scoping lookups to a specific tenant/facility
  }): Promise<AppResponse> {
    try {
      // 1. Sanitize and initialize query pagination parameters
      const page = Math.max(1, params.page || 1);
      const limit = Math.max(1, Math.min(100, params.limit || 10)); // Caps results at 100 rows per call
      const skip = (page - 1) * limit;

      // 2. Build Prisma dynamic where filters safely
      const whereClause: Prisma.UserWhereInput = {};

      if (typeof params.isActive === "boolean") {
        whereClause.isActive = params.isActive;
      }

      if (params.role) {
        whereClause.role = { equals: params.role, not: "SUPER_ADMIN" };
      } else {
        whereClause.role = { not: "SUPER_ADMIN" };
      }

      if (params.facilityId) {
        whereClause.facilityId = params.facilityId;
      }

      // Handle multi-field text search index mappings safely
      if (params.search) {
        const cleanSearch = params.search.trim();
        whereClause.OR = [
          { fullName: { contains: cleanSearch, mode: "insensitive" } },
          { email: { contains: cleanSearch, mode: "insensitive" } },
          { customId: { contains: cleanSearch, mode: "insensitive" } },
        ];
      }

      // 3. Execute concurrent database queries to avoid execution blocking
      const [dbUsers, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            customId: true,
            email: true,
            fullName: true,
            role: true,
            phone: true,
            isActive: true,
            needsPasswordChange: true,
            createdAt: true,
            lastLoginAt: true,
            facility: {
              select: {
                id: true,
                customId: true,
                name: true,
                type: true,
                location: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc", // Latest registered users show up first
          },
          skip,
          take: limit,
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      // 4. Transform results strictly to conform to our clean frontend type contract
      const users: AppUser[] = dbUsers.map((user) => ({
        id: user.id,
        customId: user.customId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        needsPasswordChange: user.needsPasswordChange,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        facility: user.facility
          ? {
              id: user.facility.id,
              customId: user.facility.customId,
              name: user.facility.name,
              type: user.facility.type,
              location: user.facility.location,
            }
          : null,
      }));

      const responsePayload: AppUserList = { users };

      // 5. Return success wrapper conforming strictly to AppResponse
      return {
        success: true,
        status: 200,
        message: "User account list retrieved successfully from the directory.",
        data: responsePayload,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };

    } catch (error) {
      console.error("🚨 Critical System Level Get-All-Users Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal system failure executing user directory lookup.",
      };
    }
  }

  static async createUser(
  payload: CreateUserInput,
  userId: string,
  facilityId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<AppResponse> {
  try {
    const validation = CreateUserSchema.safeParse(payload);
    if (!validation.success) {
      return {
        success: false,
        status: 400,
        error: validation.error.errors[0]?.message || "Invalid user payload.",
      } as AppResponse;
    }

    const validatedData = validation.data;
    const cleanEmail = validatedData.email.trim().toLowerCase();

    // 1. Generate Temporary Password
    const tempPassword = randomBytes(6).toString("hex"); // e.g., "a1b2c3d4e5f6"
    const hashedPassword = await hashPassword(tempPassword);

    const existingUser = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return {
        success: false,
        status: 409,
        error: "A user with this email already exists.",
      } as AppResponse;
    }

   
    const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [UserRole.ADMIN], userId);

    // 2. Atomic Transaction (Database Writes Only)
    const createdUser = await prisma.$transaction(async (tx) => {
      const customUserId = await generateNextCustomId({
        tx,
        facilityId,
        sequenceType: "USER_ID",
        prefix: "USR",
      });

      const user = await tx.user.create({
        data: {
          customId: customUserId,
          email: cleanEmail,
          password: hashedPassword,
          fullName: validatedData.fullName.trim(),
          role: validatedData.role,
          phone: validatedData.phone?.trim() || null,
          facilityId: validatedData.facilityId || null,
          isActive: validatedData.isActive,
          needsPasswordChange: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          facilityId: facilityId,
          action: AuditAction.USER_CREATED,
          entityType: AuditEntity.USER,
          entityId: user.id, // <--- CHANGE THIS FROM createdUser.id TO user.id
          userAgent: userAgent || null,
          ipAddress: ipAddress || null,
          details: {
            message: "New user account created with temporary credentials.",
            userName: user.fullName, // Also use 'user' here for consistency
            email: user.email,
            role: user.role,
          },
        },
      });

      if (recipientIds.length === 0) {
        console.warn(`⚠️ Notification Triggered, but no recipients found for Role: ADMIN in Facility: ${facilityId}`);
        // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
      } else {
        await NotificationService.createNotificationInTx(
          tx,
          facilityId,
          "New User Created",
          `User "${user.fullName}" has been added.`,
          NotificationType.USER,
          recipientIds
        );
      }

      return user;
    });

    // 3. Dispatch Email AFTER Transaction Commits
    // If this fails, the user is already created in the DB, 
    // so we catch the error but return success for the user creation.
    try {
      await sendTempPasswordEmail(
        createdUser.email,
        createdUser.email,
        tempPassword, // Send the PLAINTEXT password
        createdUser.fullName,
        "System Administration Portal"
      );
    } catch (mailError) {
      console.error("⚠️ Mailer Error: User created, but email failed:", mailError);
      // We don't return failure here because the user record IS created successfully.
    }

    return {
      success: true,
      status: 201,
      message: `User "${createdUser.fullName}" created. Temporary password sent to email.`,
      data: createdUser,
    } as AppResponse;

  } catch (error) {
    console.error("🚨 Critical System Level Create-User Service Error:", error);
    return {
      success: false,
      status: 500,
      error: "Internal failure occurred while processing user creation.",
    } as AppResponse;
  }
}

  static async updateUser(
    id: string,
    payload: UpdateUserInput,
    userId: string,
    facilityId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      const validation = UpdateUserSchema.safeParse({ ...payload, id });
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: validation.error.errors[0]?.message || "Invalid update payload.",
        } as AppResponse;
      }

      const validatedData = validation.data;
      const existingUser = await prisma.user.findUnique({
        where: { id: validatedData.id },
      });

      if (!existingUser) {
        return {
          success: false,
          status: 404,
          error: "User not found.",
        } as AppResponse;
      }

      if (validatedData.email && validatedData.email !== existingUser.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email: validatedData.email.trim().toLowerCase(),
            id: { not: validatedData.id },
          },
        });

        if (emailExists) {
          return {
            success: false,
            status: 409,
            error: "Another user is already using this email.",
          } as AppResponse;
        }
      }

       const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [UserRole.ADMIN], userId);

      const result = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: validatedData.id },
          data: {
            ...validatedData,
            id: undefined,
            email: validatedData.email?.trim().toLowerCase() || existingUser.email,
            fullName: validatedData.fullName?.trim() || existingUser.fullName,
            phone: validatedData.phone?.trim() || null,
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            facilityId: facilityId,
            action: AuditAction.USER_UPDATED,
            entityType: AuditEntity.USER,
            entityId: updatedUser.id,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            details: {
              message: "User account updated.",
              changes: validatedData,
            },
          },
        });

        // 3. Conditional Notifications
      // Check if Role changed
      if (validatedData.role && validatedData.role !== existingUser.role) {
        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {
            
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              "User Role Updated",
              `User "${updatedUser.fullName}" role changed to ${validatedData.role}.`,
              NotificationType.USER,
              recipientIds
            );
          }
        }

      // Check if Status (Active/Disabled) changed
      if (validatedData.isActive !== undefined && validatedData.isActive !== existingUser.isActive) {
        const statusText = validatedData.isActive ? "enabled" : "disabled";
        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {
            
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              `User Account ${validatedData.isActive ? "Enabled" : "Disabled"}`,
              `User "${updatedUser.fullName}" account has been ${statusText}.`,
              NotificationType.USER,
              recipientIds
            );
          }

      }

        return updatedUser;
      });

      return {
        success: true,
        status: 200,
        message: `User "${result.fullName}" updated successfully.`,
        data: result,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Update-User Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal failure occurred while updating user details.",
      } as AppResponse;
    }
  }

  static async toggleUserStatus(
    id: string,
    userId: string,
    facilityId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return {
          success: false,
          status: 404,
          error: "User not found.",
        } as AppResponse;
      }

      const recipientIds = await NotificationService.getRecipientIdsByRoles(facilityId, [UserRole.ADMIN], userId);

      const result = await prisma.$transaction(async (tx) => {
        const newStatus = !existingUser.isActive;

        const updatedUser = await tx.user.update({
          where: { id },
          data: { isActive: !existingUser.isActive },
        });

        await tx.auditLog.create({
          data: {
            userId,
            facilityId: facilityId,
            action: AuditAction.USER_UPDATED,
            entityType: AuditEntity.USER,
            entityId: updatedUser.id,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            details: {
              message: `User status changed to ${updatedUser.isActive ? "active" : "inactive"}.`,
              previousStatus: existingUser.isActive,
              newStatus: updatedUser.isActive,
            },
          },
        });




        if (recipientIds.length === 0) {
            console.warn(`⚠️ Notification Triggered, but no recipients found Facility: ${facilityId}`);
            // Optional: You could fallback to a 'SYSTEM' user or log this to a monitoring tool
          } else {           
            await NotificationService.createNotificationInTx(
              tx,
              facilityId,
              `User Account ${newStatus ? "Activated" : "Deactivated"}`,
              `The account for "${updatedUser.fullName}" has been ${newStatus ? "activated" : "deactivated"}.`,
              NotificationType.USER,
              recipientIds
            );
          }

        // Notification
        return updatedUser;
      });

      return {
        success: true,
        status: 200,
        message: `User "${result.fullName}" status updated successfully.`,
        data: result,
      } as AppResponse;

    } catch (error) {
      console.error("🚨 Critical System Level Toggle-User-Status Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal failure occurred while updating user status.",
      } as AppResponse;
    }
  }
}