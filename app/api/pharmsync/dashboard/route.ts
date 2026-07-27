import { getAppSession } from "@/lib/auths/auths-functions";
import { prisma } from "@/lib/database/dbConnection";
import { NextResponse } from "next/server";

export async function GET() {
   const session = await getAppSession();
   if (!session || typeof session === "string") {
       return NextResponse.json({ error: "Unauthorized", success: false }, { status: 401 });
   }
   const { facilityId } = session;

  try {
    // 1. Total active drugs count (global catalog count or adjust if Drug has facilityId)
    const totalDrugs = await prisma.drug.count({
      where: { isDeleted: false },
    });
    
    // 2. Fetch inventories for this specific facility with related drug data
    const inventories = await prisma.inventory.findMany({
      where: { 
        isDeleted: false,
        facilityId,
      },
      include: { drug: true },
    });

    const totalInventoryValue = inventories.reduce((acc, inv) => {
      return acc + (inv.availableQuantity * Number(inv.unitPrice || 0));
    }, 0);

    const totalInStock = inventories.reduce((acc, inv) => acc + inv.availableQuantity, 0);

    const lowStockItems = inventories.filter(
      (inv) => inv.availableQuantity <= inv.minStockLevel
    );

    // 3. Expiring soon items (within next 30 days) for this specific facility
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringInventories = await prisma.inventory.findMany({
      where: {
        isDeleted: false,
        facilityId,
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
      include: { drug: true, facility: true },
      take: 5,
    });

    // 4. Fetch orders associated with this specific facility
    const orders = await prisma.order.findMany({
      where: {
        requesterId: facilityId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        supplier: true,
        requester: true,
        items: true,
        requestedBy: true,
        approvedBy: true,
      },
    });

    const orderStatusCounts = orders.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      metrics: {
        totalDrugs,
        totalInventoryValue,
        totalInStock,
        lowStockCount: lowStockItems.length,
        expiringCount: expiringInventories.length,
        pendingOrdersCount: orderStatusCounts["PENDING"] || 0,
        totalOrdersCount: orders.length,
      },
      charts: {
        orderStatusData: [
          { name: "Pending", value: orderStatusCounts["PENDING"] || 0, color: "#f59e0b" },
          { name: "Approved", value: orderStatusCounts["APPROVED"] || 0, color: "#10b981" },
          { name: "Shipped / In Transit", value: orderStatusCounts["SHIPPED"] || 0, color: "#8b5cf6" },
          { name: "Completed", value: orderStatusCounts["COMPLETED"] || 0, color: "#3b82f6" },
          { name: "Cancelled", value: orderStatusCounts["CANCELLED"] || 0, color: "#ef4444" },
        ],
      },
      lists: {
        lowStock: lowStockItems.slice(0, 5),
        expiringSoon: expiringInventories,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("API Dashboard Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}