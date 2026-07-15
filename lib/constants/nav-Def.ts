import { NavGroup, NavItem } from "@/types/types/app.type";
import {
  LayoutDashboard,
  Pill,
  Layers,
  PackageSearch,
  Boxes,
  ClipboardList,
  ArrowRightLeft,
  Building2,
  Users,
  Bell,
  FileClock,
  ChartColumn,
  Settings,
  UserCircle,
  PackagePlus,
  History,
} from "lucide-react";


export const navConfig: NavGroup[] = [
   {
    title: "Admin Controls",
    accessKey: "admin",
    routeBase: "admin",
    icon: UserCircle,
    items: [
      { title: "Admin Dashboard", accessKey: "admin-dashboard", icon: UserCircle },
      // { title: "Settings", accessKey: "settings", icon: Settings },
    ],
  },
  {
    title: "Dashboard",
    accessKey: "dashboard",
    routeBase: "dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Drug Management",
    accessKey: "drug-management",
    routeBase: "drugs",
    icon: Pill,
    items: [
      { title: "Drug List", accessKey: "drug-list", icon: PackageSearch },
      // { title: "Add Drug", accessKey: "add-drug", icon: PackagePlus },
      { title: "Categories", accessKey: "drug-categories", icon: Layers },
    ],
  },

  {
    title: "Inventory",
    accessKey: "inventory",
    routeBase: "inventory",
    icon: Boxes,
    items: [
      { title: "Inventory List", accessKey: "inventory-list", icon: PackageSearch },
      { title: "Stock Movements", accessKey: "stock-movements", icon: ArrowRightLeft },
      { title: "Adjustment History", accessKey: "adjustment-history", icon: History },
    ],
  },

  {
    title: "Orders",
    accessKey: "orders",
    routeBase: "orders",
    icon: ClipboardList,
    items: [
      { title: "All Orders", accessKey: "all-orders", icon: ClipboardList },
      { title: "Incoming Orders", accessKey: "incoming-orders", icon: ArrowRightLeft },
      { title: "Outgoing Orders", accessKey: "outgoing-orders", icon: ArrowRightLeft },
      { title: "Create Order", accessKey: "create-order", icon: PackagePlus },
    ],
  },

  {
    title: "Facilities",
    accessKey: "facilities",
    routeBase: "facilities",
    icon: Building2,
  },

  {
    title: "Users",
    accessKey: "users",
    routeBase: "users",
    icon: Users,
  },

  {
    title: "Reports",
    accessKey: "reports",
    routeBase: "reports",
    icon: ChartColumn,
    items: [
      { title: "Inventory Report", accessKey: "inventory-report", icon: Boxes },
      { title: "Stock Movement Report", accessKey: "stock-movement-report", icon: ArrowRightLeft },
      { title: "Low Stock Report", accessKey: "low-stock-report", icon: PackageSearch },
      { title: "Expiry Report", accessKey: "expiry-report", icon: History },
      { title: "Order Report", accessKey: "order-report", icon: ClipboardList },
    ],
  },

  {
    title: "Notifications",
    accessKey: "notifications",
    routeBase: "notifications",
    icon: Bell,
  },

  {
    title: "Audit Logs",
    accessKey: "audit-logs",
    routeBase: "audit-logs",
    icon: FileClock,
  },

  {
    title: "Account",
    accessKey: "account",
    routeBase: "account",
    icon: UserCircle,
    items: [
      { title: "Profile", accessKey: "profile", icon: UserCircle },
      { title: "Settings", accessKey: "settings", icon: Settings },
    ],
  },
];


// 2. Transformer parser engine
export function parseNavConfig(
  items: NavGroup[]
): (Omit<NavGroup, 'items'> & { url: string; items?: (NavItem & { url: string })[] })[] {
  return items.map((group) => {
    const cleanParentRoute = group.routeBase.replace(/^\//, "");
    const parentUrl = `/${cleanParentRoute}`;

    return {
      ...group,
      url: parentUrl,
      items: group.items?.map((subItem) => {
        const cleanSubKey = subItem.accessKey.replace(/^\//, "");
        
        return {
          ...subItem,
          url: `${parentUrl}/${cleanSubKey}`,
        };
      }),
    };
  });
}

const NON_VISIBLE_ROUTES = ["add-drug"]
// 3. Automated data pipeline export matching your secondary application structure
export const parsedNavData = parseNavConfig(navConfig);
const configRouteKeys = parsedNavData.flatMap((group) => [
  group.accessKey,
  ...(group.items?.map((item) => item.accessKey) || []),
]);

export const All_ROUTE_LIST = Array.from(new Set([...configRouteKeys, ...NON_VISIBLE_ROUTES]));
