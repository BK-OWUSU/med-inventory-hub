import { AuditAction, AuditEntity, MovementReason, NotificationType, OrderStatus, OrderType, StockMovementType, UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/database/dbConnection";
import { CreateOrderInput, createOrderSchema, GetOrdersQueryInput, getOrdersQuerySchema, ReceivedOrderItemInput, UpdateOrderInput } from "@/types/schemas/order.schema";
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
      console.log('RAW DATA')
      console.log(input)
      console.log('PARSED DATA')
      console.log(validatedData)

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
   * Updates an order's items, total value, and notes while it is still in PENDING status
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
      

        // 1. If new items are provided, validate drugs, recalculate total, and replace old items
        let newTotalValue = Number(order.totalValue);

        // 1. If new items are provided, replace the old items cleanly and recalculate total
        if (input.items && input.items.length > 0) {
          const drugIds = input.items.map((i) => i.drugId);
          const drugs = await tx.drug.findMany({
            where: { id: { in: drugIds } },
          });
          const drugMap = new Map(drugs.map((d) => [d.id, d]));

          // Validate all drugs exist and are active
          for (const item of input.items) {
            const drug = drugMap.get(item.drugId);
            if (!drug || !drug.isActive || drug.isDeleted) {
              throw new Error(`Drug with ID ${item.drugId} not found or inactive.`);
            }
          }

          // Delete existing items
          await tx.orderItem.deleteMany({
            where: { orderId: orderId },
          });

          let calculatedTotal = 0;
          const orderItemsData = input.items.map((item) => {
            const drug = drugMap.get(item.drugId)!;
            const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : 0;
            const lineTotal = unitPrice * item.quantityRequested;
            calculatedTotal += lineTotal;

            return {
              orderId: orderId,
              drugId: item.drugId,
              quantityRequested: item.quantityRequested,
              unitPrice: unitPrice,
              drugName: drug.name,
              unit: drug.unit,
            };
          });
          await tx.orderItem.createMany({
            data: orderItemsData,
          });
          newTotalValue = calculatedTotal;
        }

        // 2. Update order-level details (notes and recalculated totalValue)
        const orderUpdate = await tx.order.update({
          where: { id: orderId },
          data: {
            notes: input.notes !== undefined ? input.notes : order.notes,
            totalValue: newTotalValue,
          },
          include: { items: { include: { drug: { select: { name: true, strength: true } } } } },
        });

        // 3. Log Audit Entry
        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.ORDER_UPDATED || AuditAction.INVENTORY_UPDATED, 
            entityType: AuditEntity.ORDER,
            entityId: order.id,
            ipAddress,
            userAgent,
            details: {
              message: "Order details and items updated.",
              orderNumber: order.customId,
              totalValue: newTotalValue,
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

  static async rejectOrder(
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
      });
      if (!order) throw new Error("Order not found.");

      // Ensure only the supplier or an authorized reviewer at the supplier facility can reject it
      if (order.supplierId !== facilityId) {
        throw new Error("Unauthorized to reject this order. Only the supplier can reject pending orders.");
      }

      // Rejection is strictly for PENDING orders
      if (order.status !== OrderStatus.PENDING) {
        throw new Error(`Cannot reject an order with status: ${order.status}. Only PENDING orders can be rejected.`);
      }

      const updatedOrder = await prisma.$transaction(async (tx) => {
        // 1. Update order status and reason
        const orderUpdate = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.REJECTED,
            rejectionReason: reason,
          },
          include: { items: true },
        });

        // 2. Log the rejection in the audit trail
        await tx.auditLog.create({
          data: {
            userId,
            facilityId,
            action: AuditAction.ORDER_REJECTED, // Reusing your existing action enum
            entityType: AuditEntity.ORDER,
            entityId: order.id,
            ipAddress,
            userAgent,
            details: { 
              message: "Order was reviewed and rejected.", 
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
        message: "Order rejected successfully.",
        data: updatedOrder,
      };
    } catch (error: unknown) {
      console.error("🚨 Error in rejectOrder:", error);
      return {
        success: false,
        status: 400,
        error: (error as Error).message || "Failed to reject order.",
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


  static async receiveOrder(
    orderId: string,
    receivedItemsInput: ReceivedOrderItemInput[], // Comes from the Receive Modal containing batchNumber
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
      if (order.requesterId !== facilityId) throw new Error("Unauthorized.");
      if (!order.supplierId) throw new Error("Order has no supplier facility.");

      const result = await prisma.$transaction(async (tx) => {
        for (const inputItem of receivedItemsInput) {
          const orderItem = order.items.find((i) => i.id === inputItem.orderItemId);
          if (!orderItem) throw new Error(`Order item not found.`);

          if (inputItem.quantitySupplied > orderItem.quantityRequested) {
            throw new Error(`Supplied quantity exceeds requested quantity.`);
          }

          // Ensure the frontend passed a batch number
          if (!inputItem.batchNumber) {
            throw new Error(`Batch number is required to receive item ${orderItem.drugName}.`);
          }

          // 1. Update order item with supplied quantity
          await tx.orderItem.update({
            where: { id: orderItem.id },
            data: { quantitySupplied: inputItem.quantitySupplied },
          });

          // 2. Strict lookup at the supplier facility using the exact batch provided in the form
          const supplierInventory = await tx.inventory.findFirst({
            where: {
              facilityId: order.supplierId!,
              drugId: orderItem.drugId,
              batchNumber: inputItem.batchNumber,
            },
          });

          if (!supplierInventory) {
            throw new Error(`Batch '${inputItem.batchNumber}' not found at supplier facility for ${orderItem.drugName}.`);
          }

          if (supplierInventory.availableQuantity < inputItem.quantitySupplied) {
            throw new Error(`Insufficient stock in batch ${inputItem.batchNumber}. Available: ${supplierInventory.availableQuantity}`);
          }

          // Deduct from supplier stock
          await InventoryService.processStockMovement({
            inventoryId: supplierInventory.id,
            type: StockMovementType.OUT,
            quantityChange: inputItem.quantitySupplied,
            referenceNo: order.customId,
            notes: `Transferred via order ${order.customId}`,
            reason: MovementReason.TRANSFER,
            orderItemId: orderItem.id,
          }, userId, order.supplierId!, ipAddress, userAgent, tx);

          // 3. Find or create matching batch inventory at the requester facility
          let requesterInventory = await tx.inventory.findFirst({
            where: {
              facilityId: facilityId,
              drugId: orderItem.drugId,
              batchNumber: inputItem.batchNumber,
            },
          });

          if (!requesterInventory) {
            requesterInventory = await tx.inventory.create({
              data: {
                facilityId: facilityId,
                drugId: orderItem.drugId,
                availableQuantity: 0,
                batchNumber: inputItem.batchNumber,
                expiryDate: supplierInventory.expiryDate,
                unitPrice: orderItem.unitPrice,
                manufacturer: supplierInventory.manufacturer,
              },
            });
          }

          // Add to requester stock
          await InventoryService.processStockMovement({
            inventoryId: requesterInventory.id,
            type: StockMovementType.IN,
            quantityChange: inputItem.quantitySupplied,
            referenceNo: order.customId,
            notes: `Received from order ${order.customId}`,
            reason: MovementReason.TRANSFER,
            orderItemId: orderItem.id,
          }, userId, facilityId, ipAddress, userAgent, tx);
        }

      // Check if all items were fully supplied
    const isFullyFulfilled = order.items.every((item) => {
      const input = receivedItemsInput.find((i) => i.orderItemId === item.id);
      return input && input.quantitySupplied >= item.quantityRequested;
    });

    const finalStatus = isFullyFulfilled ? OrderStatus.COMPLETED : OrderStatus.PARTIALLY_FULFILLED;

      return tx.order.update({
        where: { id: orderId },
        data: { status: finalStatus, receivedAt: new Date(), deliveredAt: new Date() },
        include: { items: true },
      });

    });

      return { success: true, status: 200, message: "Order completed successfully.", data: result };
    } catch (error: unknown) {
      console.error("🚨 Error in receiveOrder:", error);
      return { success: false, status: 400, error: (error as Error).message };
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

      if (order.status === OrderStatus.COMPLETED) {
        throw new Error("Cannot cancel an order that has already been completed.");
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

            // Restore the stock using processStockMovement (passing supplier facilityId and tx for atomicity)
            await InventoryService.processStockMovement(
              {
                inventoryId: inventoryRecord.id,
                type: StockMovementType.IN,
                quantityChange: item.quantitySupplied || item.quantityRequested, // Return supplied or requested quantity back to supplier
                referenceNo: order.customId,
                notes: `Stock restored due to cancellation of order ${order.customId}`,
                reason: MovementReason.AUDIT_RECONCILIATION,
                orderItemId: item.id,
              },
              userId,
              order.supplierId, // Must be the supplier facility owning the inventory
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