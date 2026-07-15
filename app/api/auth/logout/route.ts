
import { clearAppAppSessionCookie, getRequestMeta, getAppSession, clearEmailVerificationSessionCookie } from "@/lib/auths/auths-functions";
import { AuthService } from "@/lib/service/auth-services/auth-service";
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const session = await getAppSession();
  if (!session || typeof session === "string") {
    return NextResponse.json({ error: "User already logout", success: false }, { status: 401 });
  }

  const {userId, sessionId} = session;
  const {ipAddress, userAgent} = await getRequestMeta()
   
  const response = await AuthService.logout(userId, sessionId || "",ipAddress, userAgent)
  if (response.status && response.success) {
        const res = NextResponse.json({success: true, message: "Logged out successfully" },{ status: 200 })
        clearAppAppSessionCookie(res);
        clearEmailVerificationSessionCookie(res);
        res.headers.set("Cache-Control", "no-store, max-age=0");
        return res;
    } else {
        return NextResponse.json({ error: response.error, success: false }, { status: response.status || 500 });
    }
  }