import { UserRole } from "@/generated/prisma/browser";
import { All_ROUTE_LIST, parsedNavData } from "./nav-Def";

export const ROLE_ACCESS: Record<UserRole, Set<string>> = {
  SUPER_ADMIN: new Set([
    ...All_ROUTE_LIST,
  ]),

  ADMIN: new Set([
    "dashboard",

    "drug-management",
    "drug-list",
    "drug-categories",

    "inventory",
    "inventory-list",
    "stock-movements",
    "adjustment-history",

    "orders",
    "browse-stock",
    "incoming-orders",
    "outgoing-orders",
    "all-orders",

    "users",

    "reports",
    "inventory-report",
    "stock-movement-report",
    "low-stock-report",
    "expiry-report",
    "order-report",

    "notifications",
    "audit-logs",

    "account",
    "profile",
    "settings",
  ]),

  PHARMACIST: new Set([
    "dashboard",

    "drug-management",
    "drug-list",
    "drug-categories",

    "inventory",
    "inventory-list",
    "stock-movements",
    "adjustment-history",

    "orders",
    "browse-stock",
    "incoming-orders",
    "outgoing-orders",
    "all-orders",

    "reports",
    "inventory-report",
    "stock-movement-report",
    "low-stock-report",
    "expiry-report",
    "order-report",

    "notifications",

    "account",
    "profile",
    "settings",
  ]),

  STAFF: new Set([
    "dashboard",

    "inventory",
    "inventory-list",
    "stock-movements",

    "orders",
    "browse-stock",
    "incoming-orders",
    "outgoing-orders",
    "all-orders",

    "notifications",

    "account",
    "profile",
    "settings",
  ]),

  VIEWER: new Set([
    "dashboard",

    "drug-management",
    "drug-list",

    "inventory",
    "inventory-list",

    "orders",
    "browse-stock",
    "all-orders",

    "reports",
    "inventory-report",
    "stock-movement-report",
    "low-stock-report",
    "expiry-report",
    "order-report",

    "notifications",

    "account",
    "profile",
  ]),
};


export function getNavigationForRole(role: UserRole) {
  const allowed = ROLE_ACCESS[role];

  return parsedNavData
    .filter((group) => allowed.has(group.accessKey))
    .map((group) => ({
      ...group,
      items: group.items?.filter((item) => allowed.has(item.accessKey)),
    }))
    .filter((group) => !group.items || group.items.length > 0);
}