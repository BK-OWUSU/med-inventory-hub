import { FacilityType, Prisma } from "@/generated/prisma/client";

// 1. Used for the Facility's internal Inventory Dashboard
export type LocalInventoryResponse = {
  inventories: Prisma.InventoryGetPayload<{
    include: {
      drug: {
        select: {
          id: true;
          name: true;
          strength: true;
          dosageForm: true;
          unit: true;
        };
      };
    };
  }>[];
};

export type LocalInventoryItem = LocalInventoryResponse["inventories"][number];

// ---------------------------------------------------------

// 2. Used for Inter-Facility Ordering / SUPER_ADMIN global views
export type GlobalInventoryResponse = {
  inventories: Prisma.InventoryGetPayload<{
    include: {
      drug: {
        select: {
          id: true;
          name: true;
          dosageForm: true;
        };
      };
      facility: {
        select: {
          id: true;
          name: true;
          type: true; 
        };
      };
    };
  }>[];
};

export type GlobalInventoryItem = GlobalInventoryResponse["inventories"][number];


export interface LocalInventoryFilters {
  [key: string]: string | number | boolean | undefined | null; // <-- Add this line
  search?: string;
  drugId?: string;
  isLowStock?: boolean;
  isExpiringSoon?: boolean;
  daysToExpiry?: number;
  limit?: number;
  page?: number;
}

export interface GlobalInventoryFilters {
  [key: string]: string | number | boolean | undefined | null; // <-- Add this line
  search?: string;
  drugId?: string;
  facilityType?: FacilityType;
  limit?: number;
  page?: number;
}

export interface PaginationMeta {
  total: number;       // Total records matching the filters in the database
  page: number;        // The current active page
  limit: number;       // Number of records requested per page
  totalPages: number;  // Total pages calculated from total / limit
  hasNextPage: boolean;
  hasPrevPage: boolean;
}


export interface InventorySummary {
  totalItems: number;
  lowStockCount: number;
  expiringSoonCount: number;
  outOfStockCount: number;
}


export type StockAdjustmentReason = "DAMAGED" | "EXPIRED" | "THEFT" | "AUDIT_RECONCILIATION" | "DISPENSED";
export interface StockAdjustmentInput {
  inventoryId: string;
  facilityId: string;
  quantityChange: number; // Positive to add stock, negative to subtract
  reason: StockAdjustmentReason;
  notes?: string;
  userId: string; // The user making the adjustment
}