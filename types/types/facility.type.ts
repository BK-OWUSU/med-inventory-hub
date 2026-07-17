import { FacilityType, Prisma } from "@/generated/prisma/client";

export type FacilityListResponse = {
  facilities: Prisma.FacilityGetPayload<{
    include: {
      _count: {
        select: { 
          inventories: true, 
          users: true 
        };
      };
    };
  }>[];
};

export type FacilityDetailResponse = Prisma.FacilityGetPayload<{
  include: {
    // Include specific inventory items linked to the facility
    inventories: {
      include: {
        drug: {
          select: { 
            name: true, 
            strength: true, 
            unit: true 
          };
        };
      };
    };
    // Include the list of users assigned to the facility
    users: {
      select: { 
        id: true, 
        name: true, 
        email: true 
      };
    };
  };
}>;


export interface FacilityFilters {
  [key: string]: string | number | boolean | undefined | null;
  search?: string;       // For name or customId
  type?: FacilityType;
  isActive?: boolean;
  isVerified?: boolean;
  startDate?: string;    // ISO Date string
  endDate?: string;      // ISO Date string
  page?: number;
  limit?: number;
}