import { UserRole } from "@/generated/prisma/browser";
import { ROLE_PERMISSIONS } from "../constants/RolePermisionDef";

export function hasPermission(
  role: UserRole,
  permission: string
): boolean {
  const permissions = ROLE_PERMISSIONS[role];

  return (
    permissions.includes("*") ||
    permissions.includes(permission)
  );
}