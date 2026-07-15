"use client";

import React from "react";
import { DrugWithCategory } from "@/types/types/drugs.types";
import { 
  Pill, 
  Tag, 
  FileText, 
  Activity, 
  ShieldAlert, 
  Calendar, 
  Layers,
  Scale,
  Warehouse,
  ArrowRightLeft,
  Building2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Helper to format Date safely
const formatDate = (dateInput: Date | string) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

interface DrugDetailsProps {
  drug: DrugWithCategory | null;
  currentFacilityId?: string; // 👈 Inject the facility ID of the active session
}

export function DrugDetails({ drug, currentFacilityId }: DrugDetailsProps) {
  if (!drug) {
    return (
      <div className="flex flex-col items-center justify-center h-75 text-slate-400">
        <Pill className="h-12 w-12 animate-pulse mb-3 opacity-20" />
        <p className="text-sm">No drug details loaded.</p>
      </div>
    );
  }

  // Extract inventories safely
  const inventories = drug.inventories || [];

  // Find local inventory profile
  const localStock = currentFacilityId 
    ? inventories.find((inv) => inv.facilityId === currentFacilityId) 
    : null;

  const localQty = localStock?.availableQuantity ?? 0;
  const localMin = localStock?.minStockLevel ?? 20;
  const localManufacturer = localStock?.manufacturer || "Not Specified";

  // Filter other peer facilities that have physical inventory on hand
  const peerStocks = currentFacilityId
    ? inventories.filter((inv) => inv.facilityId !== currentFacilityId && inv.availableQuantity > 0)
    : [];

  // Determine local badge levels
  let stockBadgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let stockStatusLabel = "In Stock";

  if (localQty === 0) {
    stockBadgeColor = "bg-rose-50 text-rose-700 border-rose-200";
    stockStatusLabel = "Out of Stock";
  } else if (localQty <= localMin) {
    stockBadgeColor = "bg-amber-50 text-amber-700 border-amber-200";
    stockStatusLabel = "Low Stock Warning";
  }

  return (
    <div className="space-y-6 py-2 max-h-[85vh] overflow-y-auto pr-1">
      {/* 1. Header Section with Badge & Main Info */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center h-14 w-14 shrink-0 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
          <Pill className="h-7 w-7" />
        </div>
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded">
              {drug.customId}
            </span>
            {drug.isControlled && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] font-bold px-1.5 py-0">
                Controlled
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight truncate">
            {drug.name}
          </h2>
          <p className="text-sm text-slate-500 font-medium truncate">
            {drug.genericName || "No generic name mapped"}
          </p>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* 2. Key Status Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">Control Status</span>
          <div>
            {drug.isControlled ? (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-semibold px-2 py-0.5 rounded-md text-xs">
                <ShieldAlert className="h-3 w-3 mr-1 shrink-0" /> Controlled Substance
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium px-2 py-0.5 rounded-md text-xs">
                Regular item
              </Badge>
            )}
          </div>
        </div>

        <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 font-medium">System Status</span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`h-2.5 w-2.5 rounded-full ${drug.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"}`} />
            <span className="text-sm font-semibold text-slate-700">
              {drug.isActive ? "Active globally" : "Inactive / Archived"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Local Facility Inventory Status Panel (Conditional display if currentFacilityId is present) */}
      {currentFacilityId && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Warehouse className="h-3.5 w-3.5 text-slate-400" /> Local Branch Stock Context
          </h3>
          <div className="p-4 bg-slate-50/40 border border-slate-100 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Local Inventory Available</span>
              <Badge variant="outline" className={`${stockBadgeColor} px-2.5 py-0.5 font-bold`}>
                {stockStatusLabel} ({localQty} {drug.unit})
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-100/60">
              <div>
                <span className="text-slate-400 block mb-0.5">Min Stock Threshold</span>
                <span className="font-semibold text-slate-800">{localMin} units</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Manufacturer</span>
                <span className="font-semibold text-slate-800 truncate block">{localManufacturer}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Cross-Facility Availability (Inter-Branch Sourcing Section) */}
      {currentFacilityId && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" /> Inter-Facility Stock Availability
          </h3>
          {peerStocks.length === 0 ? (
            <div className="text-center p-4 bg-slate-50/20 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400">No stock available at any other facility in the network.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {peerStocks.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg bg-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">{p.facility?.name}</span>
                  </div>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold text-xs">
                    {p.availableQuantity} {drug.unit}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Clinical Specifications */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" /> Clinical Properties
        </h3>
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">
          
          <div className="grid grid-cols-3 p-3 items-center">
            <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-slate-400" /> Strength
            </span>
            <span className="col-span-2 text-sm font-semibold text-slate-900 text-right">
              {drug.strength || "—"}
            </span>
          </div>

          <div className="grid grid-cols-3 p-3 items-center">
            <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-slate-400" /> Dosage Form
            </span>
            <span className="col-span-2 text-sm font-semibold text-slate-900 text-right">
              {drug.dosageForm || "—"}
            </span>
          </div>

          <div className="grid grid-cols-3 p-3 items-center">
            <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-slate-400" /> Unit Type
            </span>
            <span className="col-span-2 text-sm font-semibold text-slate-900 text-right">
              {drug.unit}
            </span>
          </div>

          <div className="grid grid-cols-3 p-3 items-center">
            <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-slate-400" /> Category
            </span>
            <span className="col-span-2 text-sm font-semibold text-emerald-700 text-right">
              {drug.category?.name || "Uncategorized"}
            </span>
          </div>

        </div>
      </div>

      {/* 6. Description Section */}
      {drug.description && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Description & Notes
          </h3>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
              {drug.description}
            </p>
          </div>
        </div>
      )}

      {/* 7. System Footers */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <Calendar className="h-3.5 w-3.5" />
          <span>Created: {formatDate(drug.createdAt)}</span>
        </div>
        {drug.updatedAt && drug.updatedAt !== drug.createdAt && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last Updated: {formatDate(drug.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}