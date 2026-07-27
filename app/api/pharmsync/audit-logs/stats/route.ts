import { getAppSession } from "@/lib/auths/auths-functions";
import { AuditLogService } from "@/lib/service/auth-services/audit-log.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getAppSession();
    
    if (!session || typeof session === "string") {
      return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
    }

    const { role, facilityId } = session;
    const isSuperAdmin = role === "SUPER_ADMIN";

    // If Super Admin, pass undefined for global stats. Otherwise, scope by facilityId.
    const stats = await AuditLogService.getAuditStats(isSuperAdmin ? undefined : facilityId);

    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error) {
    console.error("API_AUDIT_STATS_ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch audit statistics." }, { status: 500 });
  }
}