import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // Import this
import { NotificationListResponse } from "@/types/types/notification.types";
import { notificationBadgeStyles, notificationIcons } from "@/lib/constants/notification-constants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useTransition } from "react";
import { markNotificationAsReadAction, markNotificationAsUnReadAction } from "@/lib/actions/notification.action";
import { useNotificationStore } from "@/store/notificationStore";

type NotificationItemData = NotificationListResponse["notifications"][number];

export function NotificationItem({ notification }: { notification: NotificationItemData }) {
  const {fetchNotifications} = useNotificationStore();
  const [isPending, startTransition] = useTransition();
  const recipient = notification.recipients[0];
  const isRead = recipient?.isRead ?? true; 

  const Icon = notificationIcons[notification.type];
  const badgeStyle = notificationBadgeStyles[notification.type];

  // Calculate relative time
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { 
    addSuffix: true 
  });


    const handleMarkAsRead = (id: string) => {
      startTransition(async () => {
        await markNotificationAsReadAction(id);
        fetchNotifications();
      });
    };
    
    const handleMarkAsUnRead = (id: string) => {
      startTransition(async () => {
        await markNotificationAsUnReadAction(id);
        fetchNotifications();
      });
    };

  return (
    <div className={cn(
      "group flex items-center gap-4 py-4 px-4 border-b border-slate-100 hover:bg-slate-50 transition-colors",
      !isRead && "bg-slate-50/50"
    )}>
      {/* Unread indicator */}
      <div className={cn("h-2 w-2 rounded-full", !isRead ? "bg-green-800" : "bg-transparent")} />
      
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
        
        {/* Dynamic time */}
        <span className="text-xs text-slate-400 w-24 text-right">
            {timeAgo}
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isRead && (
            <DropdownMenuItem
              disabled = {isPending} 
              className="flex items-center gap-2 cursor-pointer text-slate-700"
              onClick={()=> handleMarkAsRead(notification.id)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as read
            </DropdownMenuItem>)} 
            {isRead && (
            <DropdownMenuItem 
              className="flex items-center gap-2 cursor-pointer text-slate-700"
              disabled = {isPending}
              onClick={()=> handleMarkAsUnRead(notification.id)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as unread
            </DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}