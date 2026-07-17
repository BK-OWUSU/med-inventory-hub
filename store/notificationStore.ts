import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { NotificationFilters, NotificationListResponse } from "@/types/types/notification.types";

interface NotificationStore {
  notifications: NotificationListResponse['notifications'];
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
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

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/notifications${queryString}`);
      const notificationsData = response.data.data as NotificationListResponse['notifications'] || []
      set({
        notifications: notificationsData,
        isLoading: false,
      });
    } catch (err) {
      console.error("NOTIFICATION_FETCH_ERROR: ", err);
      set({
        notifications: [],
        error: "Failed to load notifications.",
        isLoading: false,
      });
    }
  },
}));
