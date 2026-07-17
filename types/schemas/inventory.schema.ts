import { z } from "zod";
import { StockMovementType } from "@/generated/prisma/browser" 

// Schema for adding a completely new batch/inventory record
export const addInventorySchema = z.object({
  drugId: z.string().min(1, "Please select a drug from the catalogue"),
  batchNumber: z.string().min(1, "Batch number is required"),
  manufacturer: z.string().optional(),
  availableQuantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative").optional(),
  minStockLevel: z.coerce.number().int().min(0, "Minimum stock level cannot be negative").default(20),
  expiryDate: z.coerce.date({
    required_error: "Expiry date is required",
  }),
  receivedDate: z.coerce.date().default(() => new Date()),
});

export type AddInventoryInput = z.input<typeof addInventorySchema>;

// Schema for updating existing stock (which must create a StockMovement)
export const updateStockSchema = z.object({
  inventoryId: z.string().min(1, "Inventory ID is required"),
  // Using nativeEnum if you export it from Prisma, or a standard z.enum
  type: z.nativeEnum(StockMovementType, {
    required_error: "Please specify the type of stock movement",
  }),
  // We strictly require a positive number for the movement amount
  quantity: z.coerce.number().int().positive("Quantity must be greater than zero"),
  notes: z.string().optional(),
});

export type UpdateStockInput = z.infer<typeof updateStockSchema>;