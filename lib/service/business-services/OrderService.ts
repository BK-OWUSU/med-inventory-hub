import { AuditAction, AuditEntity, MovementReason, NotificationType, OrderStatus, OrderType, StockMovementType, UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/database/dbConnection";
import { CreateOrderInput, createOrderSchema, GetOrdersQueryInput, getOrdersQuerySchema, UpdateOrderInput } from "@/types/schemas/order.schema";
import { AppResponse } from "@/types/types/app.type";
import { NotificationService } from "./notification.service";
import { generateNextCustomId } from "@/lib/utils";
import { InventoryService } from "./inventory.service";
import { Prisma } from "@/generated/prisma/client";
import { OrderWithRelations } from "@/types/types/orders.type";

export class OrderService {
  /**
   * Creates a new order (Incoming/Outgoing request or supply)
   */
  static async createOrder(
    input: CreateOrderInput,
    userId: string,
    facilityId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      const validatedData = createOrderSchema.parse(input);

      if (validatedData.supplierId && validatedData.supplierId === facilityId) {
        throw new Error("A facility cannot send an order to itself.");
      }

      let supplierRecipientIds: string[] = [];
      if (validatedData.supplierId) {
        supplierRecipientIds = await NotificationService.getRecipientIdsByRoles(
          validatedData.supplierId,
          [UserRole.ADMIN, UserRole.PHARMACIST, UserRole.STAFF],
          userId
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        const requesterFacility = await tx.facility.findUnique({
          where: { id: facilityId },
        });
        if (!requesterFacility || !requesterFacility.isActive || requesterFacility.isDeleted) {
          throw new Error("Requester facility not found, inactive, or deleted.");
        }

        if (validatedData.supplierId) {
          const supplierFacility = await tx.facility.findUnique({
            where: { id: validatedData.supplierId },
          });
          if (!supplierFacility || !supplierFacility.isActive || supplierFacility.isDeleted) {
            throw new Error("Supplier facility not found, inactive, or deleted.");
          }
        }

        let totalValue = 0;
        const orderItemsData = [];

        for (const itemInput of validatedData.items) {
          const drug = await tx.drug.findUnique({
            where: { id: itemInput.drugId },
          });

          if (!drug || !drug.isActive || drug.isDeleted) {
            throw new Error(`Drug with ID ${itemInput.drugId} not found or inactive.`);
          }

          const unitPrice = itemInput.unitPrice !== undefined ? itemInput.unitPrice : 0;
          const lineTotal = Number(unitPrice) * itemInput.quantityRequested;
          totalValue += lineTotal;

          orderItemsData.push({
            drugId: drug.id,
            drugName: drug.name,
            strength: drug.strength,
            dosageForm: drug.dosageForm,
            unit: drug.unit,
            quantityRequested: itemInput.quantityRequested,
            unitPrice: unitPrice,
          });
        }

        const customId = await generateNextCustomId({
          tx,
          facilityId,
          sequenceType: "ORDER",
          prefix: "ORD",
        });

        const order = await tx.order.create({
          data: {
            customId,
            requesterId: facilityId,
            supplierId: validatedData.supplierId || null,
            type: validatedData.type || OrderType.REQUEST,
            status: OrderStatus.PENDING,
            requestedById: userId,
            notes: validatedData.notes,
            totalValue: totalValue,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: true,
            requester: { select: { name: true, location: true } },
            supplier: { select: { name: true, location: true } },
          },
        });

        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.ORDER_CREATED,
            entityType: AuditEntity.ORDER,
            entityId: order.id,
            ipAddress,
            userAgent,
            details: {
              message: "Order successfully created.",
              orderNumber: order.customId,
              supplierId: order.supplierId,
              itemCount: order.items.length,
              totalValue,
            },
          },
        });

        if (validatedData.supplierId && supplierRecipientIds.length > 0) {
          await NotificationService.createNotificationInTx(
            tx,
            validatedData.supplierId,
            "New Incoming Order Request",
            `Facility ${requesterFacility.name} has submitted a new order (${order.customId}) containing ${order.items.length} item(s). Total Value: GH₵ ${totalValue.toFixed(2)}`,
             NotificationType.ORDER,
            supplierRecipientIds
          );
        }

        return order;
      });

      return {
        success: true,
        status: 201,
        message: "Order created successfully.",
        data: result,
      };
    } catch (error: unknown) {
      console.error("🚨 Error in createOrder:", error);
      return {
        success: false,
        status: 400,
        error: (error as Error).message || "Failed to create order.",
      };
    }
  }

  /**
   * Updates an order's items and notes while it is still in PENDING status
   */
  static async updateOrder(
    orderId: string,
    input: UpdateOrderInput,
    userId: string,
    facilityId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("Order not found.");
      if (order.requesterId !== facilityId) {
        throw new Error("Unauthorized: Only the requester facility can update this order.");
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new Error("Orders can only be modified while they are in PENDING status.");
      }

      const updatedOrder = await prisma.$transaction(async (tx) => {
// 1. If new items are provided, replace the old items cleanly
        if (input.items && input.items.length > 0) {
          await tx.orderItem.deleteMany({
            where: { orderId: orderId },
          });

          // Fetch drug details to satisfy Prisma's required snapshot fields (drugName, unit)
          const drugIds = input.items.map((i) => i.drugId);
          const drugs = await tx.drug.findMany({
            where: { id: { in: drugIds } },
          });
          const drugMap = new Map(drugs.map((d) => [d.id, d]));

          await tx.orderItem.createMany({
            data: input.items.map((item) => {
              const drug = drugMap.get(item.drugId);
              return {
                orderId: orderId,
                drugId: item.drugId,
                quantityRequested: item.quantityRequested,
                unitPrice: item.unitPrice || 0,
                drugName: drug?.name || "Unknown Drug", 
                unit: drug?.unit || "OTHER"           
              };
            }),
          });
        }
        // 2. Update order-level details (like notes) if provided
        const orderUpdate = await tx.order.update({
          where: { id: orderId },
          data: {
            notes: input.notes !== undefined ? input.notes : order.notes,
          },
          include: { items: { include: { drug: { select: { name: true, strength: true } } } } },
        });

        // 3. Log Audit Entry
        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.INVENTORY_UPDATED, // Use AuditAction.ORDER_UPDATED if available in your enum
            entityType: AuditEntity.ORDER,
            entityId: order.id,
            ipAddress,
            userAgent,
            details: {
              message: "Order details and items updated.",
              orderNumber: order.customId,
            },
          },
        });

        return orderUpdate;
      });

      return {
        success: true,
        status: 200,
        message: "Order updated successfully.",
        data: updatedOrder,
      };
    } catch (error: unknown) {
      console.error("🚨 Error in updateOrder:", error);
      return {
        success: false,
        status: 400,
        error: (error as Error).message || "Failed to update order.",
      };
    }
  }

 /**
   * Retrieves a paginated and filtered list of orders for a facility using Zod validation and strict typing
   */
  static async getOrders(
    facilityId: string,
    queryInput: GetOrdersQueryInput
  ): Promise<AppResponse> {
    try {
      const filters = getOrdersQuerySchema.parse(queryInput);

      // 1. Build dynamic facility perspective condition with strict typing
      let facilityCondition: Prisma.OrderWhereInput = {};
      if (filters.perspective === "requester") {
        facilityCondition = { requesterId: facilityId };
      } else if (filters.perspective === "supplier") {
        facilityCondition = { supplierId: facilityId };
      } else {
        facilityCondition = {
          OR: [
            { requesterId: facilityId },
            { supplierId: facilityId },
          ],
        };
      }

      // 2. Build additional dynamic filters using Prisma.OrderWhereInput
      const whereClause: Prisma.OrderWhereInput = {
        AND: [
          facilityCondition,
          filters.status ? { status: filters.status } : {},
          filters.type ? { type: filters.type } : {},
          filters.search
            ? {
                OR: [
                  { customId: { contains: filters.search, mode: "insensitive" } },
                  { notes: { contains: filters.search, mode: "insensitive" } },
                ],
              }
            : {},
          filters.startDate || filters.endDate
            ? {
                createdAt: {
                  ...(filters.startDate ? { gte: filters.startDate } : {}),
                  ...(filters.endDate ? { lte: filters.endDate } : {}),
                },
              }
            : {},
        ],
      };

      // 3. Pagination calculations
      const skip = (filters.page - 1) * filters.limit;
      const take = filters.limit;

      // 4. Execute queries concurrently (fetch data + total count)
      const [orders, totalCount] = await Promise.all([
        prisma.order.findMany({
          where: whereClause,
          include: {
            items: {
              include: {
                drug: { select: { name: true, strength: true, dosageForm: true } },
              },
            },
            requester: { select: { id: true, name: true, location: true } },
            supplier: { select: { id: true, name: true, location: true } },
          },
          orderBy: {
            [filters.sortBy]: filters.sortOrder,
          },
          skip,
          take,
        }),
        prisma.order.count({ where: whereClause }),
      ]);

      return {
        success: true,
        status: 200,
        message: "Orders retrieved successfully.",
        data: orders as OrderWithRelations[],
        meta: {
          pagination: {
            total: totalCount,
            page: filters.page,
            limit: filters.limit,
            totalPages: Math.ceil(totalCount / filters.limit),
          },
        },
      };
    } catch (error: unknown) {
      console.error("🚨 Error in getOrders:", error);
      return {
        success: false,
        status: 400,
        error: (error as Error).message || "Failed to retrieve orders.",
      };
    }
  }

  /**
   * Approves a pending order (performed by supplier facility)
   */
  static async approveOrder(
    orderId: string,
    userId: string,
    facilityId: string, // Supplier facility ID
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, requester: true },
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      if (order.supplierId !== facilityId) {
        throw new Error("Unauthorized: Only the designated supplier facility can approve this order.");
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new Error(`Only pending orders can be approved. Current status: ${order.status}`);
      }

      const requesterRecipientIds = await NotificationService.getRecipientIdsByRoles(
        order.requesterId,
        [UserRole.ADMIN, UserRole.PHARMACIST, UserRole.STAFF],
        userId
      );

      const updatedOrder = await prisma.$transaction(async (tx) => {
        const orderUpdate = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.APPROVED,
            approvedById: userId,
            approvedAt: new Date(),
          },
          include: { items: true },
        });

        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.ORDER_APPROVED,
            entityType: AuditEntity.ORDER,
            entityId: order.id,
            ipAddress,
            userAgent,
            details: {
              message: "Order approved.",
              orderNumber: order.customId,
            },
          },
        });

        if (requesterRecipientIds.length > 0) {
          await NotificationService.createNotificationInTx(
            tx,
            order.requesterId,
            "Order Approved",
            `Your order (${order.customId}) has been approved by the supplier facility.`,
            NotificationType.ORDER,
            requesterRecipientIds
          );
        }

        return orderUpdate;
      });

      return {
        success: true,
        status: 200,
        message: "Order approved successfully.",
        data: updatedOrder,
      };
    } catch (error: unknown) {
      console.error("🚨 Error in approveOrder:", error);
      return {
        success: false,
        status: 400,
        error: (error as Error).message || "Failed to approve order.",
      };
    }
  }

  /**
   * Marks an order as shipped (performed by supplier facility) and deducts inventory
   */
  static async shipOrder(
    orderId: string,
    userId: string,
    facilityId: string, // Supplier facility ID
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("Order not found.");
      if (order.supplierId !== facilityId) throw new Error("Unauthorized supplier action.");
      if (order.status !== OrderStatus.APPROVED) {
        throw new Error("Order must be approved before it can be shipped.");
      }

      const requesterRecipientIds = await NotificationService.getRecipientIdsByRoles(
        order.requesterId,
        [UserRole.ADMIN, UserRole.PHARMACIST, UserRole.STAFF],
        userId
      );

      const updatedOrder = await prisma.$transaction(async (tx) => {
        // 1. Process inventory deduction for each item in the order from the supplier's stock
        for (const item of order.items) {
          // Find the supplier's inventory record for this drug (checking for sufficient stock, ordered by expiry for FIFO)
          const inventoryRecord = await tx.inventory.findFirst({
            where: {
              facilityId: facilityId,
              drugId: item.drugId,
              availableQuantity: { gte: item.quantityRequested },
            },
            orderBy: { expiryDate: 'asc' },
          });

          if (!inventoryRecord) {
            throw new Error(`Insufficient stock or inventory record not found for drug ID: ${item.drugId}`);
          }

          // Reuse the unified processStockMovement method passing the active transaction client (tx)
          await InventoryService.processStockMovement(
            {
              inventoryId: inventoryRecord.id,
              type: StockMovementType.OUT,
              quantityChange: -item.quantityRequested, // Negative change to deduct outgoing stock
              referenceNo: order.customId,
              notes: `Shipped out for order ${order.customId}`,
              reason: MovementReason.TRANSFER, // Or your designated fulfillment reason
            },
            userId,
            facilityId,
            ipAddress,
            userAgent,
            tx // Pass the transaction client to ensure atomic rollback if anything fails
          );
        }

        // 2. Update order status to SHIPPED
        const orderUpdate = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.SHIPPED,
          },
          include: { items: true },
        });

        // 3. Log Audit Entry
        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.ORDER_DELIVERED, // Or ORDER_SHIPPED depending on your enum
            entityType: AuditEntity.ORDER,
            entityId: order.id,
            ipAddress,
            userAgent,
            details: { message: "Order marked as shipped and inventory deducted.", orderNumber: order.customId },
          },
        });

        // 4. Trigger Notification to Requester Facility
        if (requesterRecipientIds.length > 0) {
          await NotificationService.createNotificationInTx(
            tx,
            order.requesterId,
            "Order Shipped / In Transit",
            `Your order (${order.customId}) has been shipped and is now in transit.`,
            NotificationType.ORDER,
            requesterRecipientIds
          );
        }

        return orderUpdate;
      });

      return {
        success: true,
        status: 200,
        message: "Order marked as shipped successfully and stock deducted.",
        data: updatedOrder,
      };
    } catch (error: unknown) {
      console.error("🚨 Error in shipOrder:", error);
      return {
        success: false,
        status: 400,
        error: (error as Error).message || "Failed to update shipment status.",
      };
    }
  }
 /**
   * Receives an order and reconciles inventory for the requester facility using processStockMovement
   */
  static async receiveOrder(
    orderId: string,
    receivedItemsInput: { orderItemId: string; quantitySupplied: number; inventoryId?: string; batchNumber?: string; expiryDate?: Date }[],
    userId: string,
    facilityId: string, // Requester facility ID
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("Order not found.");
      if (order.requesterId !== facilityId) throw new Error("Unauthorized: Only the requester facility can receive this order.");
      if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.APPROVED) {
        throw new Error("Order must be shipped or approved before it can be received.");
      }

      const result = await prisma.$transaction(async (tx) => {
        for (const inputItem of receivedItemsInput) {
          const orderItem = order.items.find(i => i.id === inputItem.orderItemId);
          if (!orderItem) throw new Error(`Order item ID ${inputItem.orderItemId} not found in this order.`);

          // 1. Update order item with supplied quantity
          await tx.orderItem.update({
            where: { id: orderItem.id },
            data: { quantitySupplied: inputItem.quantitySupplied },
          });

          // 2. Find or create inventory record at the receiving facility
          let inventoryId = inputItem.inventoryId;
          if (!inventoryId) {
            const existingInventory = await tx.inventory.findFirst({
              where: {
                facilityId: facilityId,
                drugId: orderItem.drugId,
                batchNumber: inputItem.batchNumber || null,
              },
            });

            if (existingInventory) {
              inventoryId = existingInventory.id;
            } else {
              const newInv = await tx.inventory.create({
                data: {
                  facilityId: facilityId,
                  drugId: orderItem.drugId,
                  availableQuantity: 0, // Starts at 0, processStockMovement will safely increment it
                  batchNumber: inputItem.batchNumber || "DEFAULT-BATCH",
                  expiryDate: inputItem.expiryDate || null,
                  unitPrice: orderItem.unitPrice,
                },
              });
              inventoryId = newInv.id;
            }
          }

          // 3. Delegate stock increment, validation, movement logs, and notifications to InventoryService
          await InventoryService.processStockMovement(
            {
              inventoryId: inventoryId,
              type: StockMovementType.IN,
              quantityChange: inputItem.quantitySupplied,
              referenceNo: order.customId,
              notes: `Received from order ${order.customId}`,
              reason: MovementReason.AUDIT_RECONCILIATION,
              orderItemId: orderItem.id, 
            },
            userId,
            facilityId,
            ipAddress,
            userAgent,
            tx // Pass transaction client for atomicity
          );
        }

        // 4. Update order status to RECEIVED
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.RECEIVED,
            receivedAt: new Date(),
            deliveredAt: new Date(),
          },
          include: { items: true },
        });

        // 5. Create Audit Log Entry
        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.ORDER_DELIVERED,
            entityType: AuditEntity.ORDER,
            entityId: order.id,
            ipAddress,
            userAgent,
            details: { message: "Order received and stock reconciled.", orderNumber: order.customId },
          },
        });

        return updatedOrder;
      });

      return {
        success: true,
        status: 200,
        message: "Order successfully received and inventory updated.",
        data: result,
      };
    } catch (error: unknown) {
      console.error("🚨 Error in receiveOrder:", error);
      return {
        success: false,
        status: 400,
        error: (error as Error).message || "Failed to process order receipt.",
      };
    }
  }

  /**
   * Cancels an order and automatically restores supplier stock if the order was already shipped
   */
  static async cancelOrder(
    orderId: string,
    reason: string,
    userId: string,
    facilityId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AppResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new Error("Order not found.");

      if (order.requesterId !== facilityId && order.supplierId !== facilityId) {
        throw new Error("Unauthorized to cancel this order.");
      }

      if (order.status === OrderStatus.RECEIVED || order.status === OrderStatus.COMPLETED) {
        throw new Error("Cannot cancel an order that has already been completed or received.");
      }

      const updatedOrder = await prisma.$transaction(async (tx) => {
        // If the order was already shipped, stock was deducted from the supplier. 
        // We need to restore that stock back to the supplier facility's inventory.
        if (order.status === OrderStatus.SHIPPED && order.supplierId) {
          for (const item of order.items) {
            // Find an existing inventory record for this drug at the supplier facility
            let inventoryRecord = await tx.inventory.findFirst({
              where: {
                facilityId: order.supplierId,
                drugId: item.drugId,
              },
              orderBy: { lastUpdated: 'desc' },
            });

            // If no inventory record exists anymore, create a recovery record to put the stock back
            if (!inventoryRecord) {
              inventoryRecord = await tx.inventory.create({
                data: {
                  facilityId: order.supplierId,
                  drugId: item.drugId,
                  availableQuantity: 0,
                  batchNumber: "RESTORED-BATCH",
                  unitPrice: item.unitPrice,
                },
              });
            }

            // Restore the stock using processStockMovement (passing tx for atomicity)
            await InventoryService.processStockMovement(
              {
                inventoryId: inventoryRecord.id,
                type: StockMovementType.IN,
                quantityChange: item.quantityRequested, // Return the requested quantity back to supplier
                referenceNo: order.customId,
                notes: `Stock restored due to cancellation of order ${order.customId}`,
                reason: MovementReason.AUDIT_RECONCILIATION,
                orderItemId: item.id,
              },
      userId,
              facilityId,
              ipAddress,
              userAgent,
              tx
            );
          }
        }

        const orderUpdate = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.CANCELLED,
            rejectionReason: reason,
          },
          include: { items: true },
        });

        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.ORDER_REJECTED,
            entityType: AuditEntity.ORDER,
            entityId: order.id,
            ipAddress,
            userAgent,
            details: { 
              message: "Order cancelled and stock restored if previously shipped.", 
              orderNumber: order.customId, 
              reason 
            },
          },
        });

        return orderUpdate;
      });

      return {
        success: true,
        status: 200,
        message: "Order cancelled successfully and inventory reconciled.",
        data: updatedOrder,
      };
    } catch (error: unknown) {
      console.error("🚨 Error in cancelOrder:", error);
      return {
        success: false,
        status: 400,
        error: (error as Error).message || "Failed to cancel order.",
      };
    }
  }
}