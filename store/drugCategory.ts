// store/drugCategoryStore.ts
import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { DrugCategoryWithCount } from "@/types/types/drugs.types";

type DrugCategoryStore = {
    categories: DrugCategoryWithCount[];
    loading: boolean;
    fetchCategories: () => Promise<void>;
}

export const useDrugCategoryStore = create<DrugCategoryStore>((set) => ({
    categories: [],
    loading: false,

    fetchCategories: async () => {
        try {
            set({ loading: true });
            const response = await apiClient.get("/drugs/categories");
            set({
                categories: response.data.data?.categories as DrugCategoryWithCount[],
                loading: false
            });
        } catch (error) {
            console.error("Error fetching drug categories: ", error);
            set({ categories: [], loading: false });
        }
    },
}));