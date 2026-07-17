import { getAppSession } from "@/lib/auths/auths-functions";
import { DrugCategoryService } from "@/lib/service/business-services/drug-category-service";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {

        const session = await getAppSession();

        if (!session || typeof session === "string") {
            return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
        }



        const response =  await DrugCategoryService.fetchCategories();

        if (response.success && response.data) {
            return NextResponse.json({success: response.success, data: response.data}, {status: 200})
        }else {
            return NextResponse.json({success: response.success, error: response.error}, {status: 500})
        }

}