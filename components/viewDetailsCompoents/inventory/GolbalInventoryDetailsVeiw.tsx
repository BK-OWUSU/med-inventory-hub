"use client";

import { 
  Pill, 
  MapPin, 
  AlertCircle, 
  Calendar, 
  Package, 
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Assuming GlobalInventoryItem interface structure
interface GlobalInventoryItem {
  id: string;
  drug: { name: string; genericName: string; dosageForm: string };
  facility: { name: string; address: string };
  availableQuantity: number;
  minStockLevel: number;
  expiryDate?: Date | string;
  batchNumber?: string;
  lastUpdated: Date | string;
}

export function GlobalInventoryDetails({ item }: { item: GlobalInventoryItem }) {
  const isLowStock = item.availableQuantity <= item.minStockLevel;
  const isOutOfStock = item.availableQuantity === 0;

  return (
    <Card className="w-full max-w-2xl overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-600" />
              {item.drug.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {item.drug.genericName} • {item.drug.dosageForm}
            </CardDescription>
          </div>
          <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"} 
                 className={`px-3 py-1 ${isLowStock && !isOutOfStock ? "bg-amber-100 text-amber-800" : ""}`}>
            {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "Healthy Stock"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Available Quantity</p>
            <p className="text-3xl font-bold text-slate-900">{item.availableQuantity}</p>
            <p className="text-xs text-slate-400 mt-1">Min. Required: {item.minStockLevel}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Facility Location</p>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">{item.facility.name}</span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-400" /> Inventory Metadata
          </h4>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500">Batch Number</span>
              <span className="font-medium text-slate-900">{item.batchNumber || "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500">Expiry Date</span>
              <span className="font-medium text-slate-900 flex items-center gap-2">
                <Calendar className="h-3 w-3 text-slate-400" />
                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "—"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500">Last Updated</span>
              <span className="font-medium text-slate-900">
                {new Date(item.lastUpdated).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Alert */}
        {isLowStock && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Low Stock Alert</p>
              <p className="text-xs text-amber-700/80">
                The inventory for {item.drug.name} has fallen below the defined minimum threshold of {item.minStockLevel}.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}