import { NextRequest, NextResponse } from "next/server";
import { MovementReason } from "@/generated/prisma/browser";
import { getAppSession } from "@/lib/auths/auths-functions";
import { InventoryService } from "@/lib/service/business-services/inventory.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession();

    if (!session || typeof session === "string") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { facilityId } = session;

    // 1. Extract query filters from the request URL
    const { searchParams } = request.nextUrl;
    
    const drugId = searchParams.get("drugId") || undefined;
    const user = searchParams.get("user") || undefined;
    const reasonParam = searchParams.get("reason");
    const reason = reasonParam ? (reasonParam as MovementReason) : undefined;

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;
    
    // Parse pagination variables safely
    const pageVal = searchParams.get("page");
    const limitVal = searchParams.get("limit");
    
    const page = pageVal ? parseInt(pageVal, 10) : undefined;
    const limit = limitVal ? parseInt(limitVal, 10) : undefined;

    // 2. Call the service passing both the facility ID and the aggregated filters
    const response = await InventoryService.getAdjustments(facilityId || "", {
      drugId,
      user,
      reason,
      startDate: startDate && !isNaN(startDate.getTime()) ? startDate : undefined,
      endDate: endDate && !isNaN(endDate.getTime()) ? endDate : undefined,
      page: page && page > 0 ? page : undefined,
      limit: limit && limit > 0 ? limit : undefined,
    });

    if (response.success && response.data) {
      return NextResponse.json(
        { 
          success: response.success, 
          data: response.data, 
          meta: response.meta 
        }, 
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: response.error || "Failed to load stock adjustment history." 
        }, 
        { status: response.status || 500 }
      );
    }
  } catch (error) {
    console.error("🚨 API Route Error in /api/inventory/adjustments:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}