import { getRequestMeta } from "@/lib/auths/auths-functions";
import { AuthService } from "@/lib/service/auth-services/auth-service";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();
    const {ipAddress, userAgent} = await getRequestMeta()
    const response  = await AuthService.login(email, password, ipAddress, userAgent)
    console.log("RESPONSE FROM LOGIN: ====>>>",response)
    return response;
}