"use client";

import * as React from "react";
import { 
  FileText, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon, 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import TableMain from "@/components/custom/table/TableMain";
import { auditLogColumns, AuditLogTableMeta } from "@/components/columnDef/audit-logs/AuditLogColumnsDef";
import { AppSheet } from "@/components/custom/drawers/AppSheet";
import { FormattedAuditLogItem } from "@/types/types/audit.type";
import { useAuditLogStore } from "@/store/auditLog.store";
import { AuditLogDetailsView } from "@/components/viewDetailsCompoents/audit-log/AuditLogDetailsViewer";

export default function AuditLogsView() {
  const { fetchAuditLogs, auditLogs, isLoading, fetchAuditStats, stats, isStatsLoading } = useAuditLogStore();
  const [isAuditLogViewerOpen, setIsAuditLogViewerOpen] = React.useState<boolean>(false);
  const [selectedAuditLog, setSelectedAuditLog] = React.useState<FormattedAuditLogItem | null>(null);
  
  const [startDate, setStartDate] = React.useState<string>("");
  const [endDate, setEndDate] = React.useState<string>("");

  React.useEffect(() => {
    fetchAuditLogs({ startDate, endDate, limit: 400 });
    fetchAuditStats();
  }, [startDate, endDate, fetchAuditLogs, fetchAuditStats]);

  return (
    <div className="space-y-6 font-sans p-6 bg-slate-50/50 min-h-screen">
      
      {/* Top Header & Date Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track every important activity performed across the system.</p>
        </div>

        {/* Date Filter Inputs */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 px-2 text-slate-400">
            <CalendarIcon className="h-4 w-4" />
            <span className="text-xs font-semibold text-slate-600">Date Filter:</span>
          </div>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="h-8 text-xs w-36 border-slate-200"
          />
          <span className="text-xs text-slate-400">to</span>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="h-8 text-xs w-36 border-slate-200"
          />
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Activities */}
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Activities</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {isStatsLoading ? "..." : (stats?.totalActivities ?? 0).toLocaleString()}
              </span>
              <div className={`flex items-center gap-1 text-xs font-bold ${stats?.totalIsPositive ?? true ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stats?.totalIsPositive ?? true ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span>{stats?.totalChangePercentage ?? "+0%"}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">vs last 7 days</p>
          </CardContent>
        </Card>

        {/* Card 2: User Logins Today */}
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">User Logins Today</span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {isStatsLoading ? "..." : (stats?.userLoginsToday ?? 0).toLocaleString()}
              </span>
              <div className={`flex items-center gap-1 text-xs font-bold ${stats?.loginsIsPositive ?? true ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stats?.loginsIsPositive ?? true ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span>{stats?.loginsChangePercentage ?? "+0%"}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">vs yesterday</p>
          </CardContent>
        </Card>

        {/* Card 3: Inventory Changes */}
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inventory Changes</span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {isStatsLoading ? "..." : (stats?.inventoryChanges ?? 0).toLocaleString()}
              </span>
              <div className={`flex items-center gap-1 text-xs font-bold ${stats?.inventoryIsPositive ?? true ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stats?.inventoryIsPositive ?? true ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span>{stats?.inventoryChangePercentage ?? "+0%"}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">vs last 7 days</p>
          </CardContent>
        </Card>

        {/* Card 4: Order Activities */}
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Activities</span>
              <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 font-mono">
                {isStatsLoading ? "..." : (stats?.orderActivities ?? 0).toLocaleString()}
              </span>
              <div className={`flex items-center gap-1 text-xs font-bold ${stats?.orderIsPositive ?? true ? 'text-emerald-600' : 'text-rose-600'}`}>
                {stats?.orderIsPositive ?? true ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span>{stats?.orderChangePercentage ?? "+0%"}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">vs last 7 days</p>
          </CardContent>
        </Card>

      </div>

      {/* Main Content Card (Table & Pagination) */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden w-full">
        <TableMain
          columns={auditLogColumns}
          data={auditLogs}
          loading={isLoading}
          tableFilterButtonVisible={true}
          columnVisibilityFilter={true}
          searchKey="customId" 
          placeholder="Search audit logs..."
          meta={{
            onViewDetails(item: FormattedAuditLogItem) {
              setIsAuditLogViewerOpen(true);
              setSelectedAuditLog(item);
            },
          } as AuditLogTableMeta}
        />
      </Card>
      
      <AppSheet
        isOpen={isAuditLogViewerOpen}
        maxWidth="xl"
        onClose={() => setIsAuditLogViewerOpen(false)}
        title="View Audit Log Details"
        description="Inspect request details before making an approval decision."
      >
        {selectedAuditLog && (<AuditLogDetailsView log={selectedAuditLog} />)}
      </AppSheet> 
      
    </div>
  );
}