import { UserRole } from "@/generated/prisma/browser";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  accessKey: string;
  icon?: LucideIcon;
  url?: string;
  routeBase?: string;
  isExternal?: boolean;
}

export interface NavGroup {
  title: string;
  accessKey: string;
  routeBase: string;
  icon?: LucideIcon;
  isExternal?: boolean;
  items?: NavItem[];
}

export type AppResponse = {
    success?: boolean;
    redirectTo?: string;
    message?: string;
    error?: string;
    status?: number;
    data?: unknown;
    meta?: unknown;
}

export type JwtPayload = {
  userId: string;
  facilityId: string;
  facilityName: string;
  role: UserRole;
  fullName: string;
  email: string;
  sessionId?: string;
  needsPasswordChange?: boolean;
};