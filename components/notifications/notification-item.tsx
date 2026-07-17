import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { NotificationListResponse } from "@/types/types/notification.types";
import { notificationBadgeStyles, notificationIcons } from "@/lib/constants/notification-constants";

type NotificationItemData = NotificationListResponse["notifications"][number];

export function NotificationItem({ notification }: { notification: NotificationItemData }) {
  const Icon = notificationIcons[notification.type];
  const badgeStyle = notificationBadgeStyles[notification.type];

  return (
    <div className={cn(
      "group flex items-center gap-4 py-4 px-4 border-b border-slate-100 hover:bg-slate-50 transition-colors",
      !notification.isRead && "bg-slate-50/50"
    )}>
      {/* Unread indicator */}
      <div className={cn("h-2 w-2 rounded-full", !notification.isRead ? "bg-green-800" : "bg-transparent")} />
      
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-green-800">
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
        <p className="text-sm text-slate-500">{notification.message}</p>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-6">
        <Badge variant="outline" className={cn("text-[10px] font-bold border", badgeStyle)}>
          {notification.type}
        </Badge>
        <span className="text-xs text-slate-400 w-24 text-right">2 minutes ago</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}