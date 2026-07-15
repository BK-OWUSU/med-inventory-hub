import { getRequestMeta } from "@/lib/auths/auths-functions";
import { AuthService } from "@/lib/service/auth-services/auth-service";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const { newPassword, confirmPassword } = await request.json();

    const data = {newPassword: newPassword, confirmPassword: confirmPassword}

    const {ipAddress, userAgent} = await getRequestMeta()
    const response  = await AuthService.resetPassword(data,request, ipAddress, userAgent)
    console.log("PASSWORD CHANGE: ", response)
    return response;
}