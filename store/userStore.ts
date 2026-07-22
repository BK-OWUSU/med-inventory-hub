import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { UserFilters, UserListResponse } from "@/types/types/user.types";

interface UserStore {
  users: UserListResponse['users'];
  isLoading: boolean;
  error: string | null;

  fetchUsers: (filters?: UserFilters) => Promise<void>;
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

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/users${queryString}`);
      const usersData = response.data.data?.users as UserListResponse['users'] || []
      set({
        users: usersData,
        isLoading: false,
      });
    } catch (err) {
      console.error("USER_FETCH_ERROR: ", err);
      set({
        users: [],
        error: "Failed to load users.",
        isLoading: false,
      });
    }
  },
}));
