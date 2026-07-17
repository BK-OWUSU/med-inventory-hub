import { Prisma, StockMovementType } from "@/generated/prisma/client";

// This mirrors the 'include' in your getStockMovements service method
export type StockMovementItem = Prisma.StockMovementGetPayload<{
  include: {
    inventory: {
      include: {
        drug: {
          select: { 
            name: true; 
            strength: true; 
            dosageForm: true; 
            unit: true 
          };
        };
      };
    };
    performedBy: { 
      select: { fullName: true } 
    };
  };
}>;

export interface MovementFilters {
  search?: string;
  type?: StockMovementType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  page?: number;
}

export interface StockMovementsSummary {
  totalIn: number;
  totalOut: number;
  adjustmentsCount: number;
  expiryLossCount: number;
  netMovement: number;
}



export interface AdjustmentsSummary {
  totalAdjustments: number;
  quantityAdjusted: number; // Net total units changed
  quantityAdded: number;    // Absolute positive units added
  averageAdjustment: number; // Average modification size
}


export interface ExecuteAdjustmentInput {
  inventoryId: string;
  quantityChange: number; // e.g., -5 for damanges, +50 for manual restocks
  type: StockMovementType; // e.g. "ADJUSTMENT" or "EXPIRY"
  referenceNo?: string;
  notes?: string;
}