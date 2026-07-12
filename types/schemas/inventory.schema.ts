import { z } from "zod"

export const inventorySchema = z.object({
  facilityId: z.string().min(1, { message: "Please select a facility." }),
  drugId: z.string().min(1, { message: "Please select a drug." }),
  manufacturer: z.string().nullable().optional(),
  availableQuantity: z
    .number()
    .int()
    .min(0, { message: "Available quantity cannot be negative." }),
  unitPrice: z
    .number()
    .min(0, { message: "Unit price cannot be negative." })
    .nullable()
    .optional(),
  minStockLevel: z
    .number()
    .int()
    .min(0, { message: "Minimum stock level cannot be negative." })
    .default(20),
  batchNumber: z.string().nullable().optional(),
  receivedDate: z.date().nullable().optional(),
  expiryDate: z.date().nullable().optional(),
})

export type InventoryFormValues = z.input<typeof inventorySchema>
export type UpdateInventoryFormValues = z.infer<typeof inventorySchema>