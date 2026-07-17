import { getAppSession } from "@/lib/auths/auths-functions";
import { InventoryService } from "@/lib/service/business-services/inventory.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession();

    // 1. Authorization check
    if (!session || typeof session === "string") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { facilityId } = session;

    // 2. Fetch the summary statistics
    const response = await InventoryService.getInventorySummary(facilityId || "");

    // 3. Return the response
    if (response.success && response.data) {
      return NextResponse.json(
        { 
          success: true, 
          data: response.data 
        }, 
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: response.error || "Failed to load inventory summary." 
        }, 
        { status: response.status || 500 }
      );
    }
  } catch (error) {
    console.error("🚨 API Route Error in /api/inventory/summary:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}