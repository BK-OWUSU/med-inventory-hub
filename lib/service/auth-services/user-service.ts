
import { Prisma } from "@/generated/prisma/client";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/database/dbConnection";
import { AppResponse } from "@/types/types/app.type";
import { AppUser, AppUserList } from "@/types/types/auth.types";


export class UserService {
  /**
   * Fetches a paginated, filterable, and searchable list of system users.
   * * @param params Filter criteria configuration parameters
   */
  static async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
    facilityId?: string; // Crucial for scoping lookups to a specific tenant/facility
  }): Promise<AppResponse> {
    try {
      // 1. Sanitize and initialize query pagination parameters
      const page = Math.max(1, params.page || 1);
      const limit = Math.max(1, Math.min(100, params.limit || 10)); // Caps results at 100 rows per call
      const skip = (page - 1) * limit;

      // 2. Build Prisma dynamic where filters safely
      const whereClause: Prisma.UserWhereInput = {};

      if (typeof params.isActive === "boolean") {
        whereClause.isActive = params.isActive;
      }

      if (params.role) {
        whereClause.role = params.role;
      }

      if (params.facilityId) {
        whereClause.facilityId = params.facilityId;
      }

      // Handle multi-field text search index mappings safely
      if (params.search) {
        const cleanSearch = params.search.trim();
        whereClause.OR = [
          { fullName: { contains: cleanSearch, mode: "insensitive" } },
          { email: { contains: cleanSearch, mode: "insensitive" } },
          { customId: { contains: cleanSearch, mode: "insensitive" } },
        ];
      }

      // 3. Execute concurrent database queries to avoid execution blocking
      const [dbUsers, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            customId: true,
            email: true,
            fullName: true,
            role: true,
            phone: true,
            isActive: true,
            needsPasswordChange: true,
            createdAt: true,
            lastLoginAt: true,
            facility: {
              select: {
                id: true,
                customId: true,
                name: true,
                type: true,
                location: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc", // Latest registered users show up first
          },
          skip,
          take: limit,
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      // 4. Transform results strictly to conform to our clean frontend type contract
      const users: AppUser[] = dbUsers.map((user) => ({
        id: user.id,
        customId: user.customId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        needsPasswordChange: user.needsPasswordChange,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        facility: user.facility
          ? {
              id: user.facility.id,
              customId: user.facility.customId,
              name: user.facility.name,
              type: user.facility.type,
              location: user.facility.location,
            }
          : null,
      }));

      const responsePayload: AppUserList = { users };

      // 5. Return success wrapper conforming strictly to AppResponse
      return {
        success: true,
        status: 200,
        message: "User account list retrieved successfully from the directory.",
        data: responsePayload,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };

    } catch (error) {
      console.error("🚨 Critical System Level Get-All-Users Service Error:", error);
      return {
        success: false,
        status: 500,
        error: "Internal system failure executing user directory lookup.",
      };
    }
  }
}