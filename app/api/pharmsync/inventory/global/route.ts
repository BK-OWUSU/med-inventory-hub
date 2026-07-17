import { NextRequest, NextResponse } from "next/server";
import { FacilityType } from "@/generated/prisma/client";
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
    
    const search = searchParams.get("search") || undefined;
    const drugId = searchParams.get("drugId") || undefined;
    const facilityType = (searchParams.get("facilityType") as FacilityType) || undefined;
    
    // Parse pagination variables safely
    const pageVal = searchParams.get("page");
    const limitVal = searchParams.get("limit");
    
    const page = pageVal ? parseInt(pageVal, 10) : undefined;
    const limit = limitVal ? parseInt(limitVal, 10) : undefined;

    // 2. Call the service passing both the ID and the aggregated filters
    const response = await InventoryService.getGlobalInventory(facilityId || "", {
      search,
      drugId,
      facilityType,
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
          error: response.error || "Failed to load global inventory pool." 
        }, 
        { status: response.status || 500 }
      );
    }
  } catch (error) {
    console.error("🚨 API Route Error in /api/inventory/global:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}