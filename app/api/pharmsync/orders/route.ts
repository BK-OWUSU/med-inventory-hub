import { NextRequest, NextResponse } from "next/server";
import { getAppSession } from "@/lib/auths/auths-functions";
import { OrderService } from "@/lib/service/business-services/OrderService";
import { OrderStatus, OrderType } from "@/generated/prisma/client";


export async function GET(request: NextRequest) {
  try {
    const session = await getAppSession();

    if (!session || typeof session === "string" || !session.facilityId) {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { facilityId } = session;

    // 1. Extract query filters from the request URL
    const { searchParams } = request.nextUrl;
    
    const statusParam = searchParams.get("status");
    const status = statusParam ? (statusParam as OrderStatus) : undefined;

    const typeParam = searchParams.get("type");
    const type = typeParam ? (typeParam as OrderType) : undefined;

    const search = searchParams.get("search") || undefined;

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const perspectiveParam = searchParams.get("perspective");
    const perspective = perspectiveParam ? (perspectiveParam as "requester" | "supplier" | "all") : undefined;

    // Parse pagination variables safely
    const pageVal = searchParams.get("page");
    const limitVal = searchParams.get("limit");
    const page = pageVal ? parseInt(pageVal, 10) : undefined;
    const limit = limitVal ? parseInt(limitVal, 10) : undefined;

    // Parse sorting parameters
    const sortByParam = searchParams.get("sortBy");
    const sortBy = sortByParam ? (sortByParam as "createdAt" | "totalValue" | "status") : undefined;

    const sortOrderParam = searchParams.get("sortOrder");
    const sortOrder = sortOrderParam ? (sortOrderParam as "asc" | "desc") : undefined;

    // 2. Call the service passing both the facility ID and the aggregated filters
    const response = await OrderService.getOrders(facilityId, {
      status,
      type,
      search,
      startDate: startDate && !isNaN(startDate.getTime()) ? startDate : undefined,
      endDate: endDate && !isNaN(endDate.getTime()) ? endDate : undefined,
      ...(perspective ? { perspective } : {}),
      ...(page && page > 0 ? { page } : {}),
      ...(limit && limit > 0 ? { limit } : {}),
      ...(sortBy ? { sortBy } : {}),
      ...(sortOrder ? { sortOrder } : {}),
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
          error: response.error || "Failed to load orders." 
        }, 
        { status: response.status || 500 }
      );
    }
  } catch (error) {
    console.error("🚨 API Route Error in /api/orders:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}