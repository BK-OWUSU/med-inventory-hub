import { Prisma } from "@/generated/prisma/browser";
/**
 * Prisma type payload representing an AuditLog record 
 * including its related User and Facility fields.
 */
export type AuditLogWithRelations = Prisma.AuditLogGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        fullName: true;
        email: true;
      };
    };
    facility: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

/**
 * Fully formatted audit log item ready for frontend consumption,
 * extending the database record with calculated UI properties.
 */
export interface FormattedAuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarText: string;
  } | null;
  facilityId: string | null;
  facilityName: string;
  ipAddress: string | null;
  userAgent: string | null;
  details: Prisma.JsonValue | null;

  // Strongly typed fields derived from details (no 'any')
  previousValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;

  createdAt: Date;
  status: "SUCCESS" | "WARNING" | "FAILED";
}

export interface AuditLogQueryResponse {
  data: FormattedAuditLogItem[];
  pagination: AuditLogPagination;
}

export interface AuditLogPagination  {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AuditStatsResponse {
  totalActivities: number;
  totalChangePercentage: string;
  totalIsPositive: boolean;
  userLoginsToday: number;
  loginsChangePercentage: string;
  loginsIsPositive: boolean;
  inventoryChanges: number;
  inventoryChangePercentage: string;
  inventoryIsPositive: boolean;
  orderActivities: number;
  orderChangePercentage: string;
  orderIsPositive: boolean;
}