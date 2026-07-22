import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma/client";
import { getAppSession } from "@/lib/auths/auths-functions";
import { UserService } from "@/lib/service/auth-services/user-service";

export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession();

    if (!session || typeof session === "string") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    
    const search = searchParams.get("search") || undefined;
    const role = (searchParams.get("role") as UserRole) || undefined;
    const facilityId = searchParams.get("facilityId") || undefined;
    
    const isActiveStr = searchParams.get("isActive");
    const isActive = isActiveStr !== null ? isActiveStr === "true" : undefined;
    
    
    const pageVal = searchParams.get("page");
    const limitVal = searchParams.get("limit");
    
    const page = pageVal ? parseInt(pageVal, 10) : undefined;
    const limit = limitVal ? parseInt(limitVal, 10) : undefined;

    const response = await UserService.getAllUsers({
      search,
      role,
      isActive,
      facilityId,
      page: page && page > 0 ? page : undefined,
      limit: limit && limit > 0 ? limit : undefined,
    });

    if (response.success) {
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
          error: response.error || "Failed to load users." 
        }, 
        { status: response.status || 500 }
      );
    }
  } catch (error) {
    console.error("API Route Error in /api/users:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
