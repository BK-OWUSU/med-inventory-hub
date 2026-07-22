import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { PaginationMeta } from "@/types/types/inventory.type";
import { OrderWithRelations } from "@/types/types/orders.type";
import { GetOrdersQueryInput } from "@/types/schemas/order.schema";

interface OrderStore {
  // Order Lists
  orders: OrderWithRelations[];
  outgoingOrders: OrderWithRelations[];
  incomingOrders: OrderWithRelations[];
  
  // Pagination & Status
  ordersMeta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: (filters?: GetOrdersQueryInput) => Promise<void>;
  fetchOutgoingOrders: (filters?: GetOrdersQueryInput) => Promise<void>;
  fetchIncomingOrders: (filters?: GetOrdersQueryInput) => Promise<void>;
}

/**
 * Helper to build query strings safely.
 */
const toQueryString = (params: object): string => {
  const searchParams = new URLSearchParams();
  const entries = Object.entries(params as Record<string, unknown>);

  entries.forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  outgoingOrders: [],
  incomingOrders: [],
  ordersMeta: null,
  isLoading: false,
  error: null,

  fetchOrders: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/orders${queryString}`);
      
      const orderData = response.data.data as OrderWithRelations[] || [];
      const metaData = response.data.meta?.pagination as PaginationMeta || null;

      set({ 
        orders: orderData, 
        ordersMeta: metaData,
        isLoading: false 
      });
    } catch (err) {
      console.log("ORDERS_FETCH_ERROR: ", err);
      set({ 
        orders: [], 
        ordersMeta: null, 
        error: "Failed to load orders.", 
        isLoading: false 
      });
    }
  },

  fetchOutgoingOrders: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      // Outgoing orders: Orders placed/requested by this facility to be sent out
      const queryWithPerspective = { ...(filters || {}), perspective: "requester" as const };
      const queryString = `?${toQueryString(queryWithPerspective)}`;
      
      const response = await apiClient.get(`/pharmsync/orders${queryString}`);
      const orderData = response.data.data as OrderWithRelations[] || [];

      set({ 
        outgoingOrders: orderData, 
        isLoading: false 
      });
    } catch (err) {
      console.log("OUTGOING_ORDERS_FETCH_ERROR: ", err);
      set({ 
        outgoingOrders: [], 
        error: "Failed to load outgoing orders.", 
        isLoading: false 
      });
    }
  },

  fetchIncomingOrders: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      // Incoming orders: Orders coming into this facility for fulfillment/supply
      const queryWithPerspective = { ...(filters || {}), perspective: "supplier" as const };
      const queryString = `?${toQueryString(queryWithPerspective)}`;
      
      const response = await apiClient.get(`/pharmsync/orders${queryString}`);
      const orderData = response.data.data as OrderWithRelations[] || [];

      set({ 
        incomingOrders: orderData, 
        isLoading: false 
      });
    } catch (err) {
      console.log("INCOMING_ORDERS_FETCH_ERROR: ", err);
      set({ 
        incomingOrders: [], 
        error: "Failed to load incoming orders.", 
        isLoading: false 
      });
    }
  },
}));