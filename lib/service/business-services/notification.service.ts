import { AppResponse } from "@/types/types/app.type";
import { prisma } from "@/lib/database/dbConnection";
import { NotificationType, Prisma, UserRole } from "@/generated/prisma/client";

export class NotificationService {


  static async getRecipientIdsByRoles(
  facilityId: string,
  roles: UserRole[], 
  excludeUserId?: string
): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      facilityId,
      role: { in: roles }, 
      isActive: true,
      ...(excludeUserId && { NOT: { id: excludeUserId } }),
    },
    select: { id: true },
  });

  return users.map((u) => u.id);
}


  // Updated method in NotificationService class
  static async createNotification(
    facilityId: string,
    title: string,
    message: string,
    type: NotificationType, 
    userId?: string
  ) {
    return await prisma.notification.create({
      data: {
        facilityId,
        userId,
        title,
        message,
        type, // Use the passed type instead of a hardcoded value
        isRead: false,
      },
    });
  }


// Create base notification + batch create recipients
  static async createNotificationInTx(
    tx: Prisma.TransactionClient,
    facilityId: string,
    title: string,
    message: string,
    type: NotificationType,
    recipientIds: string[] // Changed from single userId to array
  ) {
    // 1. Create base notification
    const notification = await tx.notification.create({
      data: {
        facilityId,
        title,
        message,
        type,
      },
    });

    // 2. Create recipients in bulk
    await tx.notificationRecipient.createMany({
      data: recipientIds.map((userId) => ({
        notificationId: notification.id,
        userId: userId,
        isRead: false,
      })),
    });

    return notification;
  }

static async getNotifications(params: {
  userId: string;
  facilityId?: string;
  isRead?: boolean;
  type?: NotificationType; // Added type parameter
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AppResponse> {
  try {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    // Filter: Must include this user in the recipients
    const whereClause: Prisma.NotificationWhereInput = {
      recipients: {
        some: { userId: params.userId },
      },
    };

    // Apply specific filters
    if (params.facilityId) {
      whereClause.facilityId = params.facilityId;
    }

    if (params.type) {
      whereClause.type = params.type; // Added type filter logic
    }

    // Filter read status specific to this user
    if (typeof params.isRead === "boolean") {
      whereClause.recipients = {
        some: { userId: params.userId, isRead: params.isRead },
      };
    }

    if (params.search) {
      const cleanSearch = params.search.trim();
      whereClause.OR = [
        { title: { contains: cleanSearch, mode: "insensitive" } },
        { message: { contains: cleanSearch, mode: "insensitive" } },
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        include: {
          facility: {
            select: { id: true, name: true, customId: true },
          },
          recipients: {
            where: { userId: params.userId }, // Only return status for current user
            select: { isRead: true, readAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    return {
      success: true,
      status: 200,
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    } as AppResponse;
  } catch (error) {
    console.error("🚨 Critical System Level Fetch-Notifications Service Error:", error);
    return {
      success: false,
      status: 500,
      error: "Internal failure occurred while retrieving notifications.",
    } as AppResponse;
  }
}

  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<AppResponse> {
    try {
      // Target the recipient record directly
      const result = await prisma.notificationRecipient.updateMany({
        where: {
          notificationId,
          userId,
          isRead: false,
        },
        data: { 
          isRead: true, 
          readAt: new Date() 
        },
      });

      if (result.count === 0) {
        return { success: false, status: 404, error: "Notification not found or already read." };
      }

      return { success: true, status: 200, message: "Notification marked as read." };
    } catch (error) {
      return { success: false, status: 500, error: "Internal failure." };
    }
  }

   static async markAsUnRead(
    notificationId: string,
    userId: string
  ): Promise<AppResponse> {
    try {
      // Target the recipient record directly
      const result = await prisma.notificationRecipient.updateMany({
        where: {
          notificationId,
          userId,
          isRead: true,
        },
        data: { 
          isRead: false, 
        },
      });

      if (result.count === 0) {
        return { success: false, status: 404, error: "Notification not found or already read." };
      }

      return { success: true, status: 200, message: "Notification marked as read." };
    } catch (error) {
      return { success: false, status: 500, error: "Internal failure." };
    }
  }

  static async markAllAsRead(
    userId: string,
    facilityId: string
  ): Promise<AppResponse> {
    try {
      // Update all recipients for this user in this facility
      const result = await prisma.notificationRecipient.updateMany({
        where: {
          userId,
          notification: { facilityId },
          isRead: false,
        },
        data: { 
          isRead: true, 
          readAt: new Date() 
        },
      });

      return {
        success: true,
        status: 200,
        message: `${result.count} notifications marked as read.`,
      } as AppResponse;
    } catch (error) {
      console.error("🚨 Error marking all as read:", error);
      return { success: false, status: 500, error: "Internal failure." };
    }
  }
}
