"use client";

import * as React from "react";
import { format } from "date-fns";
import { 
  Package, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  ArrowRightLeft,
  Copy,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { getInventoryByIdAction } from "@/lib/actions/inventory.action";
import { InventoryBatchDetails } from "@/types/types/inventory.type";

export function BatchDetailsView({ inventoryId }: { inventoryId: string }) {
  const [data, setData] = React.useState<InventoryBatchDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const result = await getInventoryByIdAction(inventoryId);
        if (result && 'success' in result && result.success === false) {
           setError(result.error || "Failed to load details");
        } else {
           setData(result.data as InventoryBatchDetails);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [inventoryId]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  if (error || !data) return <div className="p-4 text-red-500 text-sm font-medium">Error: {error || "Batch not found"}</div>;

  const { inventory, drug, recentMovements } = data;
  
  // Expiry Logic
  const isExpired = inventory.expiryDate && new Date(inventory.expiryDate).getTime() < new Date().getTime();

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{drug.name}</h2>
          <div className="flex items-center gap-2">
            {isExpired && (
              <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-rose-200 shadow-sm">
                <AlertTriangle className="h-3 w-3" /> Expired
              </span>
            )}
            {drug.isControlled && (
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-amber-200 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" /> Controlled
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-2">
          Batch: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">{inventory.batchNumber}</span>
          <button 
            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(inventory.batchNumber || "");
              toast.success("Batch number copied");
            }}
          >
            <Copy className="h-3.5 w-3.5 text-slate-400 hover:text-emerald-600" />
          </button>
        </p>
      </div>

      {/* 2. Key Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Package className="h-4 w-4" />} label="Available" value={inventory.availableQuantity.toString()} />
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Price" value={inventory.unitPrice?.toString() || "0.00"} />
        <StatCard 
            icon={<Calendar className="h-4 w-4" />} 
            label="Expires" 
            value={inventory.expiryDate ? format(new Date(inventory.expiryDate), "MMM dd, yyyy") : "N/A"} 
            isAlert={isExpired!}
        />
      </div>

      {/* 3. Specs Section (Stacked) */}
      <div className="space-y-4">
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <InfoBlock title="Drug Specification">
            <DetailItem label="Dosage Form" value={<Badge>{drug.dosageForm}</Badge>} />
            <DetailItem label="Strength" value={drug.strength || "-"} />
            <DetailItem label="Unit" value={<Badge>{drug.unit}</Badge>} />
          </InfoBlock>
        </div>
        
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <InfoBlock title="Batch Logistics">
            <DetailItem label="Manufacturer" value={inventory.manufacturer || "-"} />
            <DetailItem label="Received" value={inventory.receivedDate ? format(new Date(inventory.receivedDate), "MMM dd, yyyy") : "-"} />
            <DetailItem label="Min Stock" value={inventory.minStockLevel.toString()} />
          </InfoBlock>
        </div>
      </div>

      {/* 4. Movements */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-emerald-600" /> Recent Movements
        </h3>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {recentMovements.length > 0 ? (
            recentMovements.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800 capitalize">{m.type.toLowerCase()}</p>
                  <p className="text-[11px] text-slate-500 font-medium">By: {m.performedBy?.fullName}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-bold", m.quantity > 0 ? "text-emerald-600" : "text-rose-600")}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{format(new Date(m.performedAt), "HH:mm, MMM dd")}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-xs text-slate-400 italic">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Sub-components --- */

function StatCard({ icon, label, value, isAlert }: { icon: React.ReactNode; label: string; value: string; isAlert?: boolean }) {
  return (
    <div className={cn(
      "p-3 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center",
      isAlert ? "bg-rose-50 border-rose-100" : "bg-white border-slate-200"
    )}>
      <div className={cn("mb-1.5 p-1.5 rounded-lg", isAlert ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-700")}>{icon}</div>
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
      <p className={cn("text-sm font-bold mt-0.5", isAlert ? "text-rose-700" : "text-slate-900")}>{value}</p>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1.5 py-0.5 bg-slate-200/60 text-slate-700 rounded text-[10px] font-bold uppercase tracking-tight">
      {children}
    </span>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}