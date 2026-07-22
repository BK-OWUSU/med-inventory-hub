import { z } from "zod";
import { MovementReason, StockMovementType } from "@/generated/prisma/browser" 

// Schema for adding a completely new batch/inventory record
export const addDrugInventoryBatchSchema = z.object({
  drugId: z.string().min(1, "Please select a drug from the catalogue"),
  batchNumber: z.string().min(1, "Batch number is required"),
  manufacturer: z.string().optional(),
  availableQuantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative").optional(),
  minStockLevel: z.coerce.number().int().min(0, "Minimum stock level cannot be negative").default(20),
  expiryDate: z.coerce.date().refine((date) => date > new Date(), {
  message: "Expiry date cannot be in the past",
  }),
  receivedDate: z.coerce.date().default(() => new Date()),
});

export type AddDrugInventoryBatchInput = z.input<typeof addDrugInventoryBatchSchema>;



export const updateDrugInventoryBatchSchema = z.object({
  // Batch number is NOT here (Immutable)
  manufacturer: z.string().optional(),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative").optional(),
  minStockLevel: z.coerce.number().int().min(0, "Minimum stock level cannot be negative").default(20),
  // Keep as editable for data correction
  expiryDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Expiry date cannot be in the past",
  }),
  // Consider adding these if you manage stock status
  isActive: z.boolean().default(true),
});

export type UpdateDrugInventoryBatchInput = z.input<typeof updateDrugInventoryBatchSchema>;


export const stockAdjustmentSchema = z.object({
  inventoryId: z.string().min(1, "Inventory ID is required"),
  type: z.nativeEnum(StockMovementType),
  quantityChange: z.coerce.number().int().optional(),
  newQuantity: z.coerce.number().int().nonnegative("Quantity cannot be negative").optional(),

  // Use the native enum matching Prisma
  reason: z.nativeEnum(MovementReason).optional(), 
  notes: z.string().optional(),
  referenceNo: z.string().optional(),
  orderItemId: z.string().optional(),
}).refine((data) => data.newQuantity !== undefined || data.quantityChange !== undefined, {
  message: "Must provide either newQuantity or quantityChange.",
  path: ["quantityChange"],
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;