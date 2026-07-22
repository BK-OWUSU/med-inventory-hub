"use client";

import React from "react";
import { 
  Calendar, 
  Pill, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  User, 
  Hash, 
  Info 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StockAdjustmentRow } from "@/types/types/inventory.type";

interface StockAdjustmentDetailsViewProps {
  item: StockAdjustmentRow;
}

export function StockAdjustmentDetailsView({ item }: StockAdjustmentDetailsViewProps) {
  const isIncrease = item.difference > 0;
  const dateObj = new Date(item.dateTime);
  const formattedDate = !isNaN(dateObj.getTime()) 
    ? dateObj.toLocaleString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit" 
      }) 
    : "—";

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-6">
      {/* Top Identifier & Status Banner */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adjustment ID</span>
            <h4 className="text-sm font-bold text-slate-900 font-mono">{item.customId}</h4>
          </div>
        </div>
        <div className="text-right">
          <Badge 
            variant="outline" 
            className={`font-bold text-xs px-2.5 py-1 rounded-md tracking-wide flex items-center gap-1 ${
              isIncrease 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {isIncrease ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {isIncrease ? `+${item.difference} Increase` : `${item.difference} Decrease`}
          </Badge>
        </div>
      </div>

      {/* Quantity Change Overview Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Old Quantity</span>
          <p className="text-lg font-bold text-slate-700 mt-1">{item.oldQuantity}</p>
        </div>
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Difference</span>
          <p className={`text-lg font-bold mt-1 ${isIncrease ? "text-emerald-600" : "text-rose-600"}`}>
            {isIncrease ? `+${item.difference}` : item.difference}
          </p>
        </div>
        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/60 rounded-xl text-center shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase">New Quantity</span>
          <p className="text-lg font-bold text-emerald-900 mt-1">{item.newQuantity}</p>
        </div>
      </div>

      {/* Detailed Information Section */}
      <div className="space-y-4">
        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Audit Trail Information</h5>
        
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-xs">
          
          {/* Drug Name */}
          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Pill className="h-4 w-4 text-emerald-600" />
              <span>Drug Name</span>
            </div>
            <span className="font-bold text-slate-900">{item.drugName}</span>
          </div>

          {/* Batch Number */}
          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Package className="h-4 w-4 text-slate-400" />
              <span>Batch Number</span>
            </div>
            <span className="font-mono font-semibold text-slate-700">{item.batchNumber}</span>
          </div>

          {/* Inventory Name / Source */}
          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Info className="h-4 w-4 text-slate-400" />
              <span>Inventory Record</span>
            </div>
            <span className="font-medium text-slate-800">{item.inventoryName}</span>
          </div>

          {/* Reason */}
          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>Adjustment Reason</span>
            </div>
            <span className="font-semibold text-slate-800">{item.reason || "—"}</span>
          </div>

          {/* Reference No */}
          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Hash className="h-4 w-4 text-slate-400" />
              <span>Reference No.</span>
            </div>
            <span className="font-mono text-slate-700">{item.reference || "—"}</span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Date & Time</span>
            </div>
            <span className="font-medium text-slate-800">{formattedDate}</span>
          </div>

          {/* Performed By */}
          <div className="flex items-center justify-between p-3.5 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <User className="h-4 w-4 text-slate-400" />
              <span>Performed By</span>
            </div>
            <div className="flex items-center gap-1.5 text-right">
              <span className="font-semibold text-slate-900">{item.performedBy}</span>
              <span className="text-slate-400 font-normal">({item.role})</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}