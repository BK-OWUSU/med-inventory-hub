import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { NotificationFilters, NotificationListResponse } from "@/types/types/notification.types";

interface NotificationStore {
  notifications: NotificationListResponse['notifications'];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null; // Add this
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

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


export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,
  meta: null,

  fetchNotifications: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/notifications${queryString}`);
      const notificationsData = response.data.data as NotificationListResponse['notifications'] || [];
      set({ 
        notifications: notificationsData,
        meta: response.data.meta,
        isLoading: false });
    } catch (err) {
      console.error("NOTIFICATION_FETCH_ERROR: ", err);
      set({ notifications: [], error: "Failed to load notifications.", isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await apiClient.post(`/pharmsync/notifications/${notificationId}/read`);
      
      // Update local state without needing to refetch everything
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === notificationId 
            ? { 
                ...n, 
                recipients: n.recipients.map(r => ({ ...r, isRead: true })) 
              } 
            : n
        ),
      }));
    } catch (err) {
      console.error("MARK_READ_ERROR: ", err);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.post(`/notifications/mark-all-read`);
      
      // Update all local notifications to read
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          recipients: n.recipients.map(r => ({ ...r, isRead: true }))
        })),
      }));
    } catch (err) {
      console.error("MARK_ALL_READ_ERROR: ", err);
    }
  },
}));