"use client";

import * as React from "react";
import { format } from "date-fns";
import { 
  Package, 
  Loader2,
  Calendar,
  AlertCircle,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StockMovementDetails, StockMovementPayload } from "@/types/types/inventory.type";
import { getStockMovementByIdAction } from "@/lib/actions/inventory.action";

export function StockMovementDetailsView({ stockMovementId }: { stockMovementId: string }) {
  const [data, setData] = React.useState<StockMovementDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const result = await getStockMovementByIdAction(stockMovementId);
        if (result && 'success' in result && result.success === false) {
           setError(result.error || "Failed to load movement details");
        } else {
           setData(result.data as StockMovementDetails);
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [stockMovementId]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  if (error || !data) return <div className="p-4 text-red-500 text-sm font-medium">Error: {error || "Movement not found"}</div>;

  // Destructure matching the nested service return shape
  const { movement, inventory, order, performedBy } = data as unknown as StockMovementPayload;
  const drug = inventory.drug;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Movement Details</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {movement.customId}</p>
          </div>
          <MovementTypeBadge type={movement.type} />
        </div>
      </div>

      {/* 2. Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard icon={<Package className="h-4 w-4" />} label="Quantity" value={movement.quantity.toString()} />
        <StatCard icon={<Calendar className="h-4 w-4" />} label="Date" value={format(new Date(movement.performedAt), "MMM dd, yyyy")} />
        <StatCard icon={<Hash className="h-4 w-4" />} label="Batch No." value={inventory.batchNumber || "N/A"} />
      </div>

      {/* 3. Details Stack */}
      <div className="space-y-4">
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <InfoBlock title="Drug Information">
            <DetailItem label="Name" value={drug.name} />
            <DetailItem label="Form" value={<Badge>{drug.dosageForm || "N/A"}</Badge>} />
            <DetailItem label="Strength" value={drug.strength || "-"} />
          </InfoBlock>
        </div>
        
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <InfoBlock title="Metadata">
            <DetailItem label="Performed By" value={performedBy?.fullName || "System"} />
            <DetailItem label="Order Ref" value={order?.orderNumber || "Direct Adjustment"} />
            <DetailItem label="Time" value={format(new Date(movement.performedAt), "HH:mm a")} />
          </InfoBlock>
        </div>
      </div>

      {/* 4. Notes Section */}
      {movement.notes && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" /> Notes
          </h4>
          <p className="text-xs text-amber-900">{movement.notes}</p>
        </div>
      )}
    </div>
  );
}

/* --- Sub-components --- */

function MovementTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    IN: "bg-emerald-50 text-emerald-700 border-emerald-200",
    OUT: "bg-rose-50 text-rose-700 border-rose-200",
    ADJUSTMENT: "bg-blue-50 text-blue-700 border-blue-200",
    EXPIRY: "bg-amber-50 text-amber-700 border-amber-200",
    RETURN: "bg-purple-50 text-purple-700 border-purple-200",
    TRANSFER: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold border shadow-sm capitalize", styles[type] || "bg-slate-50 text-slate-700 border-slate-200")}>
      {type.toLowerCase()}
    </span>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
      <div className="text-slate-500 mb-1.5 p-1.5 bg-slate-100 rounded-lg">{icon}</div>
      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
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