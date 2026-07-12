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

export const navConfig = [
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
      {
        title: "Drug List",
        accessKey: "drug-list",
        icon: PackageSearch,
      },
      {
        title: "Add Drug",
        accessKey: "add-drug",
        icon: PackagePlus,
      },
      {
        title: "Categories",
        accessKey: "drug-categories",
        icon: Layers,
      },
    ],
  },

  {
    title: "Inventory",
    accessKey: "inventory",
    routeBase: "inventory",
    icon: Boxes,
    items: [
      {
        title: "Inventory List",
        accessKey: "inventory-list",
        icon: PackageSearch,
      },
      {
        title: "Stock Movements",
        accessKey: "stock-movements",
        icon: ArrowRightLeft,
      },
      {
        title: "Adjustment History",
        accessKey: "adjustment-history",
        icon: History,
      },
    ],
  },

  {
    title: "Orders",
    accessKey: "orders",
    routeBase: "orders",
    icon: ClipboardList,
    items: [
      {
        title: "All Orders",
        accessKey: "all-orders",
        icon: ClipboardList,
      },
      {
        title: "Incoming Orders",
        accessKey: "incoming-orders",
        icon: ArrowRightLeft,
      },
      {
        title: "Outgoing Orders",
        accessKey: "outgoing-orders",
        icon: ArrowRightLeft,
      },
      {
        title: "Create Order",
        accessKey: "create-order",
        icon: PackagePlus,
      },
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
      {
        title: "Inventory Report",
        accessKey: "inventory-report",
        icon: Boxes,
      },
      {
        title: "Stock Movement Report",
        accessKey: "stock-movement-report",
        icon: ArrowRightLeft,
      },
      {
        title: "Low Stock Report",
        accessKey: "low-stock-report",
        icon: PackageSearch,
      },
      {
        title: "Expiry Report",
        accessKey: "expiry-report",
        icon: History,
      },
      {
        title: "Order Report",
        accessKey: "order-report",
        icon: ClipboardList,
      },
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
      {
        title: "Profile",
        accessKey: "profile",
        icon: UserCircle,
      },
      {
        title: "Settings",
        accessKey: "settings",
        icon: Settings,
      },
    ],
  },
];