"use client";

import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormattedAuditLogItem } from "@/types/types/audit.type";

interface AuditLogDetailsViewProps {
  log: FormattedAuditLogItem;
}

// Safe type guard for rendering generic JSON records without `any`
function isJsonObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function AuditLogDetailsView({ log }: AuditLogDetailsViewProps) {
  const formatDateTime = (dateInput: Date | string | null) => {
    if (!dateInput) return "—";
    const dateObj = new Date(dateInput);
    if (isNaN(dateObj.getTime())) return "—";

    const dateStr = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);

    const timeStr = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);

    return `${dateStr} at ${timeStr}`;
  };

  const getActionBadgeStyle = (act: string) => {
    switch (act) {
      case "LOGIN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "INVENTORY_UPDATED":
      case "INVENTORY_ADJUSTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "ORDER_APPROVED":
      case "ORDER_DELIVERED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "USER_CREATED":
      case "FACILITY_VERIFIED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ORDER_REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadge = (status: "SUCCESS" | "WARNING" | "FAILED") => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Success
          </Badge>
        );
      case "WARNING":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 font-semibold text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Warning
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 font-semibold text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Failed
          </Badge>
        );
    }
  };

  // Format key-value pairs nicely for pre blocks using Record<string, unknown>
  const formatObjectToLines = (obj: Record<string, unknown> | null | undefined) => {
    if (!obj || Object.keys(obj).length === 0) return "No changes recorded";
    return Object.entries(obj)
      .map(([key, val]) => `${key}: ${typeof val === 'string' ? `"${val}"` : JSON.stringify(val)}`)
      .join("\n");
  };

  const detailsRecord = isJsonObject(log.details) ? log.details : {};

  return (
    <div className="space-y-6 text-xs font-sans text-slate-700 pb-8">
      
      {/* Top Banner Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`font-bold text-[10px] px-2.5 py-0.5 rounded-md ${getActionBadgeStyle(log.action)}`}>
                {log.action}
              </Badge>
              {getStatusBadge(log.status)}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {formatDateTime(log.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata Attributes List */}
      <div className="space-y-4">
        
        <div className="grid grid-cols-3 gap-2 items-start">
          <span className="text-slate-400 font-medium">Activity</span>
          <span className="col-span-2 font-semibold text-slate-900">{log.action.replace(/_/g, " ")}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 items-start">
          <span className="text-slate-400 font-medium">Entity</span>
          <span className="col-span-2 font-semibold text-slate-800">{log.entityType}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 items-start">
          <span className="text-slate-400 font-medium">User</span>
          <div className="col-span-2 space-y-0.5">
            {log.user ? (
              <>
                <p className="font-bold text-slate-900">{log.user.name}</p>
                <p className="text-[11px] text-slate-400">{log.user.email}</p>
              </>
            ) : (
              <span className="text-slate-400 italic">System User</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 items-start">
          <span className="text-slate-400 font-medium">Facility</span>
          <div className="col-span-2 space-y-0.5">
            <p className="font-semibold text-slate-800">{log.facilityName}</p>
            <p className="text-[10px] text-slate-400 font-mono">ID: {log.facilityId || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 items-start">
          <span className="text-slate-400 font-medium">Timestamp</span>
          <span className="col-span-2 font-semibold text-slate-800 font-mono">{formatDateTime(log.createdAt)}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 items-start">
          <span className="text-slate-400 font-medium">IP Address</span>
          <span className="col-span-2 font-mono text-slate-800 font-semibold">{log.ipAddress || "—"}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 items-start">
          <span className="text-slate-400 font-medium">Browser / User Agent</span>
          <span className="col-span-2 font-mono text-slate-500 text-[11px] bg-slate-50 p-2 rounded-md border border-slate-100 break-all leading-relaxed">
            {log.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"}
          </span>
        </div>

      </div>

      {/* Changes Section */}
      <div className="space-y-3 pt-2">
        <h3 className="font-bold text-slate-900 text-sm tracking-tight">Changes</h3>

        {/* Previous Values */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-500">Previous Values</p>
          <pre className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-700 whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {formatObjectToLines(log.previousValues)}
          </pre>
        </div>

        {/* New Values */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-emerald-700">New Values</p>
          <pre className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/60 font-mono text-[11px] text-emerald-900 whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {formatObjectToLines(log.newValues || detailsRecord)}
          </pre>
        </div>

      </div>

      {/* Payload JSON Section */}
      <div className="space-y-2 pt-2">
        <h3 className="font-bold text-slate-900 text-sm tracking-tight">Payload (JSON)</h3>
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto shadow-inner leading-relaxed">
          <pre>
            {JSON.stringify(
              {
                action: log.action.toLowerCase().replace(/_/g, "."),
                entity: log.entityType.toLowerCase(),
                entityId: log.id,
                userId: log.user?.id || "system",
                facilityId: log.facilityId,
                timestamp: log.createdAt,
                details: log.details || {},
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>

    </div>
  );
}