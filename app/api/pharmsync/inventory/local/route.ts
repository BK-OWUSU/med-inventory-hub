import { getAppSession } from "@/lib/auths/auths-functions";
import { InventoryService } from "@/lib/service/business-services/inventory.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession();
    if (!session || typeof session === "string") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { facilityId } = session;
    const { searchParams } = request.nextUrl;

    // 1. Extract standard filters
    const search = searchParams.get("search") || undefined;
    const drugId = searchParams.get("drugId") || undefined;
    
    // 2. Extract boolean filter flags
    const isLowStock = searchParams.get("isLowStock") === "true";
    const isExpiringSoon = searchParams.get("isExpiringSoon") === "true";
    
    // 3. Extract pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // 4. Pass everything to your service

    const response = await InventoryService.getLocalInventory(facilityId || "", {
      search,
      drugId,
      isLowStock: isLowStock || undefined, // Only pass if true
      isExpiringSoon: isExpiringSoon || undefined, // Only pass if true
      page,
      limit,
    });

    if (response.success && response.data) {
      return NextResponse.json(
        { success: true, data: response.data, meta: response.meta }, 
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: response.error }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("LOCAL INVENTORY_FETCH_ERROR: ",error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}