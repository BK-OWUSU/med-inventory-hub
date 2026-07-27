import { getAppSession } from "@/lib/auths/auths-functions";
import { DrugService } from "@/lib/service/business-services/drug-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await getAppSession();

    if (!session || typeof session === "string") {
        return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { facilityId } = session;

    // Extract query parameters from the request URL
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 10;
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;

    const response = await DrugService.fetchAllDrugs({
        facilityId, // Pass the facilityId from the session here
        page,
        limit,
        search,
        categoryId,
        isDeleted: false,
    });

    if (response.success && response.data) {
        return NextResponse.json({ success: response.success, data: response.data }, { status: 200 });
    } else {
        return NextResponse.json({ success: response.success, error: response.error }, { status: 500 });
    }
}