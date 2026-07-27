import { AuditAction, AuditEntity, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/database/dbConnection";
import { AppResponse } from "@/types/types/app.type";
import { AuditStatsResponse, FormattedAuditLogItem } from "@/types/types/audit.type";


export interface GetAuditLogsParams {
  startDate?: string | Date;
  endDate?: string | Date;
  action?: AuditAction | string;
  entityType?: AuditEntity | string;
  facilityId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}


function isJsonObject(
  value: Prisma.JsonValue | null | undefined
): value is Record<string, Prisma.JsonValue> {
  return value !== null && value !== undefined && typeof value === "object" && !Array.isArray(value);
}

export class AuditLogService {

 /**
 * Fetches paginated audit logs with dynamic filters for date ranges, actions, entities, users, and facilities.
 */
public static async getAuditLogs(params: GetAuditLogsParams): Promise<AppResponse> {
  const {
    startDate,
    endDate,
    action,
    entityType,
    facilityId,
    userId,
    page = 1,
    limit = 10,
  } = params;

  const skip = (page - 1) * limit;

  // Build dynamic where clause
  const whereClause: Prisma.AuditLogWhereInput = {};

  // Date Range Filtering
  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) {
      whereClause.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      // Set end date time to the very end of the day (23:59:59.999)
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      whereClause.createdAt.lte = endDateTime;
    }
  }

  if (action) {
    whereClause.action = action as AuditAction;
  }

  if (entityType) {
    whereClause.entityType = entityType as AuditEntity;
  }

  if (facilityId) {
    whereClause.facilityId = facilityId;
  }

  if (userId) {
    whereClause.userId = userId;
  }

  // Execute queries in parallel for performance
  const [rawLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        facility: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where: whereClause }),
  ]);

  // Format logs for frontend consumption
  const formattedData = rawLogs.map((log) => {
    const userName = log.user?.fullName || "System User";
    const nameParts = userName.split(" ");
    const avatarText = nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() 
      : userName.slice(0, 2).toUpperCase();

    // Determine log status from details or action type
    let status: "SUCCESS" | "WARNING" | "FAILED" = "SUCCESS";
    if (log.action === AuditAction.ORDER_REJECTED) {
      status = "FAILED";
    } else if (log.action === AuditAction.INVENTORY_UPDATED) {
      status = "WARNING";
    }

    // Safely parse previousValues and newValues from the JSON details field
    const detailsObj = isJsonObject(log.details) ? log.details : null;
    const previousValues = isJsonObject(detailsObj?.previousValues) ? detailsObj.previousValues : null;
    const newValues = isJsonObject(detailsObj?.newValues) ? detailsObj.newValues : null;

    return {
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      user: log.user ? {
        id: log.user.id,
        name: userName,
        email: log.user.email,
        avatarText,
      } : null,
      facilityId: log.facilityId,
      facilityName: log.facility?.name || "System Global",
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: log.details,
      previousValues,
      newValues,
      createdAt: log.createdAt,
      status,
    };
  });

  return {
    data: formattedData as FormattedAuditLogItem[],
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
 public static async getAuditStats(facilityId?: string): Promise<AuditStatsResponse> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Base where clause modifier for facility
  const facilityFilter = facilityId ? { facilityId } : {};

  const [
    totalActivities,
    previousTotalActivities,
    userLoginsToday,
    userLoginsYesterday,
    inventoryChanges,
    previousInventoryChanges,
    orderActivities,
    previousOrderActivities,
  ] = await Promise.all([
    prisma.auditLog.count({ where: { ...facilityFilter, createdAt: { gte: sevenDaysAgo } } }),
    prisma.auditLog.count({ where: { ...facilityFilter, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
    
    prisma.auditLog.count({ where: { ...facilityFilter, action: AuditAction.LOGIN, createdAt: { gte: startOfToday } } }),
    prisma.auditLog.count({ 
      where: { 
        ...facilityFilter,
        action: AuditAction.LOGIN, 
        createdAt: { 
          gte: new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000), 
          lt: startOfToday 
        } 
      } 
    }),

    prisma.auditLog.count({ 
      where: { 
        ...facilityFilter,
        entityType: AuditEntity.INVENTORY, 
        createdAt: { gte: sevenDaysAgo } 
      } 
    }),
    prisma.auditLog.count({ 
      where: { 
        ...facilityFilter,
        entityType: AuditEntity.INVENTORY, 
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } 
      } 
    }),

    prisma.auditLog.count({ 
      where: { 
        ...facilityFilter,
        entityType: AuditEntity.ORDER, 
        createdAt: { gte: sevenDaysAgo } 
      } 
    }),
    prisma.auditLog.count({ 
      where: { 
        ...facilityFilter,
        entityType: AuditEntity.ORDER, 
        createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } 
      } 
    }),
  ]);

  // Growth calculation logic remains the same...
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return { percentage: "+100%", isPositive: true };
    const diff = ((current - previous) / previous) * 100;
    const formatted = `${Math.abs(diff).toFixed(1)}%`;
    return {
      percentage: diff >= 0 ? `+${formatted}` : `-${formatted}`,
      isPositive: diff >= 0,
    };
  };

  const totalGrowth = calculateGrowth(totalActivities, previousTotalActivities);
  const loginsGrowth = calculateGrowth(userLoginsToday, userLoginsYesterday);
  const inventoryGrowth = calculateGrowth(inventoryChanges, previousInventoryChanges);
  const orderGrowth = calculateGrowth(orderActivities, previousOrderActivities);

  return {
    totalActivities,
    totalChangePercentage: totalGrowth.percentage,
    totalIsPositive: totalGrowth.isPositive,
    userLoginsToday,
    loginsChangePercentage: loginsGrowth.percentage,
    loginsIsPositive: loginsGrowth.isPositive,
    inventoryChanges,
    inventoryChangePercentage: inventoryGrowth.percentage,
    inventoryIsPositive: inventoryGrowth.isPositive,
    orderActivities,
    orderChangePercentage: orderGrowth.percentage,
    orderIsPositive: orderGrowth.isPositive,
  };
}
}