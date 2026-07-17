import { NextRequest, NextResponse } from "next/server";
import { FacilityType } from "@/generated/prisma/client";
import { getAppSession } from "@/lib/auths/auths-functions";
import { FacilityService } from "@/lib/service/business-services/facililty.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession();

    if (!session || typeof session === "string") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    // 1. Extract query filters from the request URL
    const { searchParams } = request.nextUrl;
    
    const search = searchParams.get("search") || undefined;
    const type = (searchParams.get("type") as FacilityType) || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    
    // Safely parse booleans
    const isActiveStr = searchParams.get("isActive");
    const isActive = isActiveStr !== null ? isActiveStr === "true" : undefined;
    
    const isVerifiedStr = searchParams.get("isVerified");
    const isVerified = isVerifiedStr !== null ? isVerifiedStr === "true" : undefined;
    
    // Parse pagination variables safely
    const pageVal = searchParams.get("page");
    const limitVal = searchParams.get("limit");
    
    const page = pageVal ? parseInt(pageVal, 10) : undefined;
    const limit = limitVal ? parseInt(limitVal, 10) : undefined;

    // 2. Call the service passing the aggregated filters
    const response = await FacilityService.fetchFacilities({
      search,
      type,
      isActive,
      isVerified,
      startDate,
      endDate,
      page: page && page > 0 ? page : undefined,
      limit: limit && limit > 0 ? limit : undefined,
    });

    // 3. Return the response
    if (response.success) {
      return NextResponse.json(
        { 
          success: true, 
          data: response.data, 
          meta: response.meta // Meta returned at top-level
        }, 
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: response.error || "Failed to load facilities." 
        }, 
        { status: response.status || 500 }
      );
    }
  } catch (error) {
    console.error("🚨 API Route Error in /api/facilities:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}