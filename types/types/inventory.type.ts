import { Drug, FacilityType, MovementReason, OrderStatus, OrderType, Prisma, StockMovementType } from "@/generated/prisma/client";

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
// 2. Used for Inter-Facility Ordering / SUPER_ADMIN global views
export type GlobalInventoryResponse = {
  inventories: Prisma.InventoryGetPayload<{
    include: {
      drug: {
        select: {
          id: true;
          name: true;
          dosageForm: true;
          strength: true;
          unit: true;
          _count: {
            select: {
              inventories: true; 
            },
          },
        };
      };
      facility: {
        select: {
          id: true;
          name: true;
          type: true;
          location: true; 
        };
      };
    };
  }>[];
};

export type GlobalInventoryItem = GlobalInventoryResponse["inventories"][number];
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

//INVENTORY BATCH TYPES:
type InventoryBatchWithRelations = Prisma.InventoryGetPayload<{
  include: {
    drug: {
      select: {
        id: true;
        name: true;
        strength: true;
        dosageForm: true;
        unit: true;
        genericName: true;
        isControlled: true;
      };
    };
    movements: {
      include: {
        performedBy: {
          select: { fullName: true };
        };
      };
    };
  };
}>;

/**
 * 2. Define the exact response structure matching your 'responseData' object.
 */
export type InventoryBatchDetails = {
  inventory: Pick<
    InventoryBatchWithRelations,
    | "id"
    | "batchNumber"
    | "availableQuantity"
    | "unitPrice"
    | "minStockLevel"
    | "expiryDate"
    | "receivedDate"
    | "manufacturer"
  >;
  drug: InventoryBatchWithRelations["drug"];
  recentMovements: InventoryBatchWithRelations["movements"];
};

//STOCK MOVEMENT TYPE:
export type StockMovementDetails = Prisma.StockMovementGetPayload<{
  include: {
    inventory: {
      include: {
        drug: {
          select: {
            name: true;
            strength: true;
            dosageForm: true;
            unit: true;
          };
        };
      };
    };
    orderItem: {
      include: {
        order: true;
      };
    };
    performedBy: {
      select: {
        fullName: true;
        id: true;
      };
    };
  };
}>;

export interface StockMovementPayload {
  movement: {
    id: string;
    customId: string;
    type: StockMovementType;
    quantity: number;
    notes: string | null;
    referenceNo: string | null;
    performedAt: Date;
  };
  inventory: {
    id: string;
    facilityId: string;
    drugId: string;
    drug: Drug;
    manufacturer: string | null;
    availableQuantity: number;
    unitPrice: number | null; 
    minStockLevel: number;
    batchNumber: string | null;
    receivedDate: Date | null;
    expiryDate: Date | null;
    lastUpdated: Date;
    createdAt: Date;
    isActive: boolean;
    isDeleted: boolean;
    isDeletedAt: Date | null;
    deletedBy: string | null;
  };
  order: {
    id: string;
    orderNumber: string;
    customId: string;
    requesterId: string;
    supplierId: string | null;
    type: OrderType;
    status: OrderStatus;
    requestedById: string;
    approvedById: string | null;
    notes: string | null;
    rejectionReason: string | null;
    totalValue: number | null; 
    createdAt: Date;
    updatedAt: Date;
    approvedAt: Date | null;
    receivedAt: Date | null;
    deliveredAt: Date | null;
  } | null;
  performedBy: {
    id: string;
    fullName: string;
  };
}

//INVENTORY ADJUSTMENTS
//STOCK ADJUSTMENT

export type StockAdjustmentReason = "DAMAGED" | "EXPIRED" | "THEFT" | "AUDIT_RECONCILIATION" | "DISPENSED";
export interface StockAdjustmentInput {
  inventoryId: string;
  facilityId: string;
  quantityChange: number; // Positive to add stock, negative to subtract
  reason: StockAdjustmentReason;
  notes?: string;
  userId: string; // The user making the adjustment
}


export interface StockAdjustmentRow {
  id: string;
  customId: string;
  dateTime: Date | string;
  drugName: string;
  batchNumber: string;
  inventoryName: string;  
  inventoryBatch: string;
  oldQuantity: number;
  newQuantity: number;
  difference: number;
  reason: string;
  reference: string;
  performedBy: string;
  role: string;
}

export interface AdjustmentFilters {
  drugId?: string;
  user?: string;
  reason?: MovementReason;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
