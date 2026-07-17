import { NotificationType } from "@/generated/prisma/client";
import { ShoppingCart, Package, AlertTriangle, User, Building, Info, LucideIcon } from "lucide-react";

export const notificationIcons: Record<NotificationType, LucideIcon> = {
  [NotificationType.ORDER]: ShoppingCart,
  [NotificationType.INVENTORY]: Package,
  [NotificationType.EXPIRY]: AlertTriangle,
  [NotificationType.USER]: User,
  [NotificationType.FACILITY]: Building,
  [NotificationType.SYSTEM]: Info,
};

export const notificationBadgeStyles: Record<NotificationType, string> = {
  [NotificationType.ORDER]: "bg-blue-50 text-blue-700 border-blue-200",
  [NotificationType.INVENTORY]: "bg-amber-50 text-amber-700 border-amber-200",
  [NotificationType.EXPIRY]: "bg-red-50 text-red-700 border-red-200",
  [NotificationType.USER]: "bg-violet-50 text-violet-700 border-violet-200",
  [NotificationType.FACILITY]: "bg-emerald-50 text-emerald-700 border-emerald-200",
  [NotificationType.SYSTEM]: "bg-slate-100 text-slate-700 border-slate-200",
};