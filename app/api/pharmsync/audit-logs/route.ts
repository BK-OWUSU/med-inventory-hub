import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auths/auths-functions";
import { AuditAction, AuditEntity } from "@/generated/prisma/client";
import { AuditLogService } from "@/lib/service/auth-services/audit-log.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession();

    if (!session || typeof session === "string") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { role, facilityId: userFacilityId } = session;
    const isSuperAdmin = role === "SUPER_ADMIN"; // Adjust string if your role enum differs

    // Ensure non-super-admins have a facility context
    if (!isSuperAdmin && !userFacilityId) {
      return NextResponse.json({ error: "Forbidden: Facility context required", success: false }, { status: 403 });
    }

    // 1. Extract query filters from the request URL
    const { searchParams } = request.nextUrl;
    
    const actionParam = searchParams.get("action");
    const action = actionParam ? (actionParam as AuditAction) : undefined;

    const entityTypeParam = searchParams.get("entityType");
    const entityType = entityTypeParam ? (entityTypeParam as AuditEntity) : undefined;

    // Secure facility scoping based on role:
    // - Super Admin can optionally filter via query param facilityId, or see everything (undefined)
    // - Regular users are strictly hard-locked to their own session facilityId
    const facilityIdParam = searchParams.get("facilityId");
    const facilityId = isSuperAdmin ? (facilityIdParam || undefined) : userFacilityId;

    const userIdParam = searchParams.get("userId");
    const userId = userIdParam || undefined;

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Parse pagination variables safely
    const pageVal = searchParams.get("page");
    const limitVal = searchParams.get("limit");
    const page = pageVal ? parseInt(pageVal, 10) : undefined;
    const limit = limitVal ? parseInt(limitVal, 10) : undefined;

    // 2. Call the service passing the aggregated and secured filters
    const response = await AuditLogService.getAuditLogs({
      action,
      entityType,
      facilityId,
      userId,
      startDate: startDate && !isNaN(startDate.getTime()) ? startDate : undefined,
      endDate: endDate && !isNaN(endDate.getTime()) ? endDate : undefined,
      ...(page && page > 0 ? { page } : {}),
      ...(limit && limit > 0 ? { limit } : {}),
    });

    if (response && response.data) {
      return NextResponse.json(
        { 
          success: true, 
          data: response.data, 
          meta: response.meta 
        }, 
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to load audit logs." 
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("🚨 API Route Error in /api/audit-logs:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}