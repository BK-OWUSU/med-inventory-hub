"use client";

import { useTransition } from "react";
import { 
  markNotificationAsReadAction, 
  markAllNotificationsAsReadAction 
} from "@/lib/actions/notification.action";
import { NotificationListResponse } from "@/types/types/notification.types";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export const NotificationBell = ({ notifications = [] }: {notifications: NotificationListResponse['notifications'] }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter()

  // Filter unread notifications using optional chaining for safety
  const unreadNotifications = notifications.filter((n) => !n.recipients[0]?.isRead);
  const unreadCount = unreadNotifications.length;

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      await markNotificationAsReadAction(id);
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  return (
    <div className="relative group">
      <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <div className="absolute z-9999 right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-lg hidden group-hover:block overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <span className="font-bold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="text-xs bg-green-800 text-white hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No notifications found.</p>
          ) : (
            notifications.map((n) => {
              const recipient = n.recipients[0];
              const isRead = recipient?.isRead ?? true;

              return (
                <div 
                  key={n.id} 
                  className={`p-3 border-b border-gray-50 transition-colors ${isRead ? 'bg-white opacity-70' : 'bg-blue-50/30'}`}
                >
                  <div className="text-sm font-semibold text-gray-800">{n.title}</div>
                  <div className="text-xs text-gray-600 mb-2">{n.message}</div>
                  
                  {!isRead && (
                    <Button 
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-[10px]  bg-green-800 font-medium text-green-200 hover:underline disabled:opacity-50"
                      disabled={isPending}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <Button onClick={()=> router.push("/notifications")} variant="ghost" className="w-full text-xs mb-1 text-green-800 hover:bg-green-50 hover:text-green-900 font-medium">
            <ExternalLink className="mr-2 h-3 w-3" /> View all
          </Button>
        </div>
      </div>
    </div>
  );
};