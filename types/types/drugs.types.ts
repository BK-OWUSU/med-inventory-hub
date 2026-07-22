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
      inventories: {
        include: {
          facility: {
            select: {
              id: true;
              name: true;
            };
          };
        };
      };
    };
  }>[];
};

// Reusable single drug type helper inferred from the array payload
export type DrugWithCategory = DrugListResponse["drugs"][number];



export type DrugLists = {
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

export type DrugList = DrugLists["drugs"][number];

export enum DosageForm {
  TABLET = "TABLET",
  CAPSULE = "CAPSULE",
  SYRUP = "SYRUP",
  VIAL = "VIAL",
  INJECTION = "INJECTION",
  CREAM = "CREAM",
  DROPS = "DROPS",
  SUSPENSION = "SUSPENSION",
  OINTMENT = "OINTMENT",
}


//DRUGS CATEGORY TYPES:

export type DrugCategoryListResponse = {
  categories: Prisma.DrugCategoryGetPayload<{
    include: {
      _count: {
        select: {
          drugs: true;
        };
      };   
    };
  }>[];
};

// Reusable single drug category type helper inferred from the array payload
export type DrugCategoryWithCount = DrugCategoryListResponse["categories"][number];


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