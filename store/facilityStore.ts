// store/use-facility-store.ts
import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { FacilityFilters, FacilityListResponse } from "@/types/types/facility.type";


interface FacilityStore {
  facilities: FacilityListResponse['facilities'];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchFacilities: (filters?: FacilityFilters) => Promise<void>;
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

export const useFacilityStore = create<FacilityStore>((set) => ({
  facilities: [],
  isLoading: false,
  error: null,

  fetchFacilities: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/facilities${queryString}`);
      const facilitiesData = response.data.data as FacilityListResponse['facilities'] || []
      console.log(facilitiesData)
      set({ 
        facilities: facilitiesData, 
        isLoading: false 
      });
    } catch (err) {
      console.error("FACILITY_FETCH_ERROR: ", err);
      set({ 
        facilities: [], 
        error: "Failed to load facilities.", 
        isLoading: false 
      });
    }
  },
}));