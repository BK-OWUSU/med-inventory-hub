import { hasPermission } from "@/lib/auths/accessAndPermission-functions";
import { useAuthStore } from "@/store/authStore";
import { ReactNode } from "react";

interface CanProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
}

export function Can({
  permission,
  children,
  fallback = null,
  requireAll = false,
}: CanProps) {
  const role = useAuthStore((state) => state.user?.role);

  if (!role) return <>{fallback}</>;

  const allowed = Array.isArray(permission)
    ? requireAll
      ? permission.every((p) => hasPermission(role, p))
      : permission.some((p) => hasPermission(role, p))
    : hasPermission(role, permission);

  return allowed ? <>{children}</> : <>{fallback}</>;
}