import { Prisma } from "@/generated/prisma/client";


export type DrugListResponse = {
  drugs: Prisma.DrugGetPayload<{
    include: {
      category: {
        select: {
          id: true;
          name: true;
        };
      };
    };
  }>[];
};

// Reusable single drug type helper inferred from the array payload
export type DrugWithCategory = DrugListResponse["drugs"][number];



//DRUGS TYPES:

export interface DrugCategoryTableRow {
  id: string
  name: string
  description?: string    // Included to match the UI row text column layout
  drugsCount: number      // Calculated via Prisma's `_count.drugs` aggregator
  status: boolean
  createdAt: Date | string
}
/**
 * Complete UI Dashboard State Type
 * Maps cleanly to the top metric summary items: Total | Active | Inactive | Total Drugs
 */
export interface DrugCategoryDashboardMetrics {
  totalCategories: number
  activeCategories: number
  inactiveCategories: number
  totalDrugsAcrossAllCategories: number
}