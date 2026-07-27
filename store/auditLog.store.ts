import { create } from "zustand";
import apiClient from "@/lib/api-client";
import { AuditAction, AuditEntity } from "@/generated/prisma/client";
import { AuditLogPagination, AuditStatsResponse, FormattedAuditLogItem } from "@/types/types/audit.type";

export interface GetAuditLogsQueryInput {
  action?: AuditAction | string;
  entityType?: AuditEntity | string;
  facilityId?: string;
  userId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

interface AuditLogStore {
  // Audit Log Lists
  auditLogs: FormattedAuditLogItem[];
  
  // Stats
  stats: AuditStatsResponse | null;
  isStatsLoading: boolean;

  // Pagination & Status
  auditLogsMeta: AuditLogPagination | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAuditLogs: (filters?: GetAuditLogsQueryInput) => Promise<void>;
  fetchAuditStats: () => Promise<void>;
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

export const useAuditLogStore = create<AuditLogStore>((set) => ({
  auditLogs: [],
  stats: null,
  isStatsLoading: false,
  auditLogsMeta: null,
  isLoading: false,
  error: null,

  fetchAuditLogs: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = filters ? `?${toQueryString(filters)}` : "";
      const response = await apiClient.get(`/pharmsync/audit-logs${queryString}`);
      
      const auditData = response.data.data as FormattedAuditLogItem[] || [];
      const paginationResponse = response.data.meta || response.data.meta;
      
      const metaData: AuditLogPagination | null = paginationResponse ? {
        total: paginationResponse.total,
        page: paginationResponse.page,
        limit: paginationResponse.limit,
        totalPages: paginationResponse.totalPages,
      } : null;

      set({ 
        auditLogs: auditData, 
        auditLogsMeta: metaData,
        isLoading: false 
      });
    } catch (err) {
      console.log("AUDIT_LOGS_FETCH_ERROR: ", err);
      set({ 
        auditLogs: [], 
        auditLogsMeta: null, 
        error: "Failed to load audit logs.", 
        isLoading: false 
      });
    }
  },

  fetchAuditStats: async () => {
    set({ isStatsLoading: true });
    try {
      const response = await apiClient.get("/pharmsync/audit-logs/stats");
      const statsData = response.data.data || response.data;
      
      set({ 
        stats: statsData as AuditStatsResponse, 
        isStatsLoading: false 
      });
    } catch (err) {
      console.log("AUDIT_STATS_FETCH_ERROR: ", err);
      set({ 
        isStatsLoading: false 
      });
    }
  },
}));