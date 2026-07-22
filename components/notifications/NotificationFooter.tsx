"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface NotificationFooterProps {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function NotificationFooter({ meta, onPageChange, onLimitChange }: NotificationFooterProps) {
  const { page, limit, total, totalPages } = meta;
  
  // Calculate display range
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
      {/* Showing X to Y of Z */}
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-900">{start}</span> to{" "}
        <span className="font-medium text-slate-900">{end}</span> of{" "}
        <span className="font-medium text-slate-900">{total}</span> notifications
      </p>

      <div className="flex items-center gap-4">
        {/* Pagination Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i + 1}
              variant={page === i + 1 ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                page === i + 1 ? "bg-green-900 hover:bg-green-950" : ""
              )}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Per Page Selector */}
        <Select 
          value={String(limit)} 
          onValueChange={(val) => onLimitChange(Number(val))}
        >
          <SelectTrigger className="w-30 h-8 text-sm">
            <SelectValue placeholder="10 per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}