import { OrderStatus, OrderType } from "@/generated/prisma/browser";
import { z } from "zod";


export const createOrderItemSchema = z.object({
  drugId: z.string().min(1, "Drug ID is required."),
  quantityRequested: z.number().int().positive("Quantity requested must be a positive integer."),
  unitPrice: z.number().nonnegative("Unit price cannot be negative.").optional(),
});

export const createOrderSchema = z.object({
  supplierId: z.string().optional(),
  type: z.nativeEnum(OrderType).default(OrderType.REQUEST),
  notes: z.string().optional(),
  items: z.array(createOrderItemSchema).min(1, "An order must contain at least one item."),
});

export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

//UPDATE ORDER
export const updateOrderItemSchema = z.object({
  drugId: z.string().min(1, "Drug ID is required."),
  drugName: z.string().readonly().optional(),
  quantityRequested: z.number().int().positive("Quantity requested must be a positive integer."),
  unitPrice: z.number().nonnegative("Unit price cannot be negative.").optional(),
});

export const updateOrderSchema = z.object({
  notes: z.string().optional(),
  items: z.array(updateOrderItemSchema).min(1, "An order must contain at least one item.").optional(),
});

export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;


export const getOrdersQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  type: z.nativeEnum(OrderType).optional(),
  search: z.string().optional(), // Searches order customId or notes
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  perspective: z.enum(["requester", "supplier", "all"]).default("all"), // Facility involvement filter
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["createdAt", "totalValue", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type GetOrdersQueryInput = z.input<typeof getOrdersQuerySchema>;