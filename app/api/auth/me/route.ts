import { getAppSession } from "@/lib/auths/auths-functions";
import { AuthService } from "@/lib/service/auth-services/auth-service";
import { NextResponse } from "next/server";
// export const dynamic = "force-dynamic";

export async function GET() {
        const session = await getAppSession();
    if (!session || typeof session === "string") {
            return NextResponse.json({ error: "Unauthorized",success: false }, { status: 401 });
        }
        const { userId } = session;
        const response = await  AuthService.fetchCurrentUser(userId);
        if (response.success && response.data) {
            const user = response.data;
            return NextResponse.json({ success: true, data: user }, { status: 200 });
        }else {
            return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: response.status });
    }  
}