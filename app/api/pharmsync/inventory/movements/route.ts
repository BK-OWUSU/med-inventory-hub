import { getAppSession } from "@/lib/auths/auths-functions";
import { InventoryService } from "@/lib/service/business-services/inventory.service";
import { NextRequest, NextResponse } from "next/server";
import { StockMovementType } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession();

    if (!session || typeof session === "string") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { facilityId } = session;
    const { searchParams } = request.nextUrl;

    // 1. Extract Filters
    const search = searchParams.get("search") || undefined;
    const type = (searchParams.get("type") as StockMovementType) || undefined;
    
    // Parse Dates
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    // Parse Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // 2. Call Service
    const response = await InventoryService.getStockMovements(facilityId || "", {
      search,
      type,
      startDate,
      endDate,
      page,
      limit,
    });

    // 3. Return Response
    if (response.success && response.data) {
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
        { success: false, error: response.error }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("🚨 API Route Error in /api/inventory/movements:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}