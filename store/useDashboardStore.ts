import { create } from "zustand";
import type { OrderWithRelations } from "@/types/types/orders.type";
import { Drug, Facility, Inventory } from "@/generated/prisma/browser";

export type InventoryWithDrug = Inventory & {
  drug: Drug;
};

export type ExpiringInventory = Inventory & {
  drug: Drug;
  facility: Facility;
};

interface DashboardState {
  metrics: {
    totalDrugs: number;
    totalInventoryValue: number;
    totalInStock: number;
    lowStockCount: number;
    expiringCount: number;
    pendingOrdersCount: number;
    totalOrdersCount: number;
  };
  charts: {
    orderStatusData: Array<{ name: string; value: number; color: string }>;
  };
  lists: {
    lowStock: InventoryWithDrug[];
    expiringSoon: ExpiringInventory[];
    recentOrders: OrderWithRelations[];
  };
  isLoading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: {
    totalDrugs: 0,
    totalInventoryValue: 0,
    totalInStock: 0,
    lowStockCount: 0,
    expiringCount: 0,
    pendingOrdersCount: 0,
    totalOrdersCount: 0,
  },
  charts: {
    orderStatusData: [],
  },
  lists: {
    lowStock: [],
    expiringSoon: [],
    recentOrders: [],
  },
  isLoading: false,
  error: null,
  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/pharmsync/dashboard");
      const data = await response.json();

      if (data.success) {
        set({
          metrics: data.metrics,
          charts: data.charts,
          lists: data.lists,
          isLoading: false,
        });
      } else {
        set({ error: data.error || "Failed to load", isLoading: false });
      }
    } catch (err) {
      console.log("FETCH_DASHBOARD_METRICS_FAIL: ", err)  
      set({ error: "Network error while fetching dashboard data", isLoading: false });
    }
  },
}));