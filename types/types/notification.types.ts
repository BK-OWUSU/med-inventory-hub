import { Prisma } from "@/generated/prisma/client";

// Used for the list view (e.g., in the Navbar/Bell)
export type NotificationListResponse = {
  notifications: Prisma.NotificationGetPayload<{
    include: {
      facility: {
        select: { id: true, name: true, customId: true };
      };
      recipients: {
        select: {
          userId: true;
          isRead: true;
          readAt: true;
        };
      };
    };
  }>[];
};

// Used for detailed views
export type NotificationDetailResponse = Prisma.NotificationGetPayload<{
  include: {
    facility: {
      select: {
        id: true;
        name: true;
        customId: true;
        location: true;
      };
    };
    recipients: {
      include: {
        user: {
          select: {
            id: true;
            fullName: true;
            email: true;
          };
        };
      };
    };
  };
}>;

export interface NotificationFilters {
  search?: string;
  isRead?: boolean;
  facilityId?: string;
  type?: NotificationType;
  userId?: string;
  page?: number;
  limit?: number;
}


// Move the Enum definition here manually, or export only the type
export enum NotificationType {
  ORDER = "ORDER",
  INVENTORY = "INVENTORY",
  EXPIRY = "EXPIRY",
  SYSTEM = "SYSTEM",
  USER = "USER",
  FACILITY = "FACILITY",
}

export type FilterOption = NotificationType | 'UNREAD' | undefined;