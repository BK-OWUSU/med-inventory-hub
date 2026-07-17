import { NotificationType, Prisma } from "@/generated/prisma/client";
import { ShoppingCart,Package,AlertTriangle,User,Building,Info,LucideIcon } from "lucide-react";

export type NotificationListResponse = {
  notifications: Prisma.NotificationGetPayload<{
    include: {
      facility: {
        select: {
          id: true,
          name: true,
          customId: true,
        };
      };
    };
  }>[];
};

export type NotificationDetailResponse = Prisma.NotificationGetPayload<{
  include: {
    facility: {
      select: {
        id: true,
        name: true,
        customId: true,
        location: true,
      };
    };
    users: {
      select: {
        id: true,
        fullName: true,
        email: true,
      };
    };
  };
}>;

export interface NotificationFilters {
  search?: string;
  isRead?: boolean;
  facilityId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}
