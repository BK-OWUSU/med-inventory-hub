import { Prisma } from "@/generated/prisma/client";

export type UserListResponse = {
  users: Prisma.UserGetPayload<{
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

export type UserDetailResponse = Prisma.UserGetPayload<{
  include: {
    facility: {
      select: {
        id: true,
        name: true,
        customId: true,
        location: true,
      };
    };
    requestedOrders: {
      select: {
        id: true,
        customId: true,
        status: true,
      };
    };
    approvedOrders: {
      select: {
        id: true,
        customId: true,
        status: true,
      };
    };
    performedMovements: {
      select: {
        id: true,
        customId: true,
        type: true,
        performedAt: true,
      };
    };
  };
}>;

export interface UserFilters {
  [key: string]: string | number | boolean | undefined | null;
  search?: string;
  role?: string;
  facilityId?: string;
  isActive?: boolean;
  needsPasswordChange?: boolean;
  page?: number;
  limit?: number;
}
