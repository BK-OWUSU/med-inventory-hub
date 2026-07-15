import { FacilityType, UserRole } from "@/generated/prisma/enums";

export interface AppUser {
  id: string;
  customId: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
  needsPasswordChange: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  facility: {
    id: string;
    customId: string;
    name: string;
    type: FacilityType;
    location: string;
  } | null;
}

export interface AppUserList {
  users: AppUser[];
}