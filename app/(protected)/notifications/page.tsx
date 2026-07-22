"use client";

import { useEffect, useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationSidebar } from "@/components/notifications/notification-sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bell, ChevronDown, RefreshCw, Search } from "lucide-react";
import { NotificationFooter } from "@/components/notifications/NotificationFooter";
import { FilterOption, NotificationType } from "@/types/types/notification.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import React from "react";
import { toast } from "sonner";
import { markAllNotificationsAsReadAction } from "@/lib/actions/notification.action";

export default function NotificationsPage() {
  const { notifications, isLoading, fetchNotifications, meta } = useNotificationStore();
  const [isPending, startTransition] = React.useTransition();
  
  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterOption | undefined>();

  // Fetch initial data on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Derived state: Filter the store data locally
  // const filteredNotifications = notifications.filter((n) => {
  //   const matchesSearch = 
  //     n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
  //     n.message.toLowerCase().includes(searchQuery.toLowerCase());
    
  //   const matchesType = filterType ? n.type === filterType : true;
    
  //   return matchesSearch && matchesType;
  // });

const filteredNotifications = notifications.filter((n) => {
  const matchesSearch = 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.message.toLowerCase().includes(searchQuery.toLowerCase());
  
  // Logic: 
  // 1. If UNREAD, filter by recipient status
  // 2. If NotificationType (e.g. ORDER), filter by type
  // 3. If undefined, show all
  let matchesFilter = true;
  if (filterType === 'UNREAD') {
    matchesFilter = !n.recipients[0]?.isRead;
  } else if (filterType) {
    matchesFilter = n.type === filterType;
  }
  
  return matchesSearch && matchesFilter;
});

  const handleMarkAllAsRead = () => {
    startTransition(() => {
      toast.promise(
        async () => {
          const res = await markAllNotificationsAsReadAction();
          if (!res.success) throw new Error(res.error || "Failed mark all notification");
          return res;
        },
        {
          loading: "Marking all notification...",
          success: () => {
            fetchNotifications(); // Refresh data after marking as read
            return "Marked all notifications successfully";
          },
          error: (err) => err.message
        }
      );
    });
  };

  return (
    <div className="w-full p-6 lg:p-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated with important alerts and activities.</p>
        </div>
        <div className="flex gap-3">
          <Button
           onClick={handleMarkAllAsRead}
           disabled={isPending}
           className="bg-green-900 hover:bg-green-800 text-white">
             {isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <> Mark all as read</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col h-full gap-8">
          <NotificationSidebar 
            notifications={notifications}
            activeType={filterType}
            onFilterChange={setFilterType} 
            />
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          <Card className="shadow-none border-slate-200">
            {/* Toolbar */}
            <div className="p-4 border-b flex items-center justify-between gap-4">
              <h2 className="font-semibold text-slate-900 whitespace-nowrap">
                All Notifications 
                <span className="text-green-800 bg-green-50 px-2 py-0.5 rounded text-xs ml-2">
                  {filteredNotifications.length}
                </span>
              </h2>

              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search notifications..." 
                  className="pl-9 h-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 gap-2 text-sm">
                      Type: <span className="font-semibold">{filterType || "All"}</span> 
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType(undefined)}>
                        All
                    </DropdownMenuItem>
                    {Object.values(NotificationType).map((type) => (
                      <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                        {type}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Display Logic */}
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">Loading...</div>
            ) : filteredNotifications.length > 0 ? (
              <>
                <div className="divide-y">
                  {filteredNotifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </div>
                
                {/* Note: Pagination footer might behave differently now since you are filtering locally */}
                {meta && (
                  <NotificationFooter 
                    meta={meta} 
                    onPageChange={(page) => fetchNotifications({ page })} 
                    onLimitChange={(limit) => fetchNotifications({ limit })} 
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Bell className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No notifications found</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting your search or filters to see more results.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}