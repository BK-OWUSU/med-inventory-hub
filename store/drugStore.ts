// store/drugStore.ts
import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { DrugWithCategory } from "@/types/types/drugs.types";

type DrugStore = {
    drugs: DrugWithCategory[]; // 👈 Safe: Always an array
    loading: boolean;
    fetchDrugs: () => Promise<void>;
}

export const useDrugStore = create<DrugStore>((set) => ({
    drugs: [], // 👈 Initialize as an empty array instead of null
    loading: false,

    fetchDrugs: async () => {
        try {
            set({ loading: true });
            const response = await apiClient.get("/medhub/drugs");
            set({
                drugs: (response.data.data?.drugs as DrugWithCategory[]) || [],
                loading: false
            });
        } catch (error) {
            console.error("Error fetching drugs: ", error);
            set({ drugs: [], loading: false }); // 👈 Fallback to empty array
        }
    },
}));