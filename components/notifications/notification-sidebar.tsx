"use client";

import { Bell, AlertCircle, ShoppingCart, Package, Calendar, Settings, User, Building, LucideIcon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns"; 
import { FilterOption, NotificationListResponse, NotificationType } from "@/types/types/notification.types";
import { notificationIcons } from "@/lib/constants/notification-constants";

interface SidebarLinkProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

function SidebarLink({ icon: Icon, label, count, active, onClick }: SidebarLinkProps) {
  return (
    <Button
      variant="secondary" 
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
        active 
          ? "bg-green-800 text-white font-medium hover:bg-green-700" 
          : "text-slate-600 hover:bg-slate-50"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-500")} />
        {label}
      </div>
      {count !== undefined && (
        <span className={cn("text-xs", active ? "text-white font-bold" : "text-slate-400")}>
          {count}
        </span>
      )}
    </Button>
  );
}

// Sidebar now accepts notifications as a prop instead of using the store
interface NotificationSidebarProps {
  notifications: NotificationListResponse['notifications'];
  activeType?: FilterOption; // New: Pass current filter
  onFilterChange: (type: FilterOption ) => void; // New: Pass handler
}

export function NotificationSidebar({ notifications, activeType, onFilterChange }: NotificationSidebarProps) {
  // Stats are calculated from the passed prop
  const stats = {
    all: notifications.length,
    unread: notifications.filter(n => !n.recipients[0]?.isRead).length,
    order: notifications.filter(n => n.type === NotificationType.ORDER).length,
    inventory: notifications.filter(n => n.type === NotificationType.INVENTORY).length,
    expiry: notifications.filter(n => n.type === NotificationType.EXPIRY).length,
    system: notifications.filter(n => n.type === NotificationType.SYSTEM).length,
    user: notifications.filter(n => n.type === NotificationType.USER).length,
    facility: notifications.filter(n => n.type === NotificationType.FACILITY).length,
  };

  return (
    <div className="space-y-6 w-full">
      <Card className="rounded-xl border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">Filter by</h3>
        <div className="space-y-0.5">
         <Card className="rounded-xl border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">Filter by</h3>
        <div className="space-y-1">
          {/* We define active based on whether activeType is undefined */}
          <SidebarLink 
            icon={Bell} 
            label="All Notifications" 
            count={stats.all} 
            active={activeType === undefined}
            onClick={() => onFilterChange(undefined)} 
          />
          
          {/* Note: If Unread is not a NotificationType, you might need a custom handler */}
          <SidebarLink 
            icon={AlertCircle} 
            label="Unread" 
            count={stats.unread} 
            active={activeType === 'UNREAD'} // Example
            onClick={() => onFilterChange('UNREAD')} 
          />

          <SidebarLink 
            icon={ShoppingCart} 
            label="Orders" 
            count={stats.order} 
            active={activeType === NotificationType.ORDER}
            onClick={() => onFilterChange(NotificationType.ORDER)} 
          />
          <SidebarLink 
            icon={Package} 
            label="Inventory & Stock" 
            count={stats.inventory} 
            active={activeType === NotificationType.INVENTORY}
            onClick={() => onFilterChange(NotificationType.INVENTORY)} 
          />
          <SidebarLink 
            icon={Calendar} 
            label="Expiries" 
            count={stats.expiry} 
            active={activeType === NotificationType.EXPIRY}
            onClick={() => onFilterChange(NotificationType.EXPIRY)} 
          />
          <SidebarLink 
            icon={Settings} 
            label="System" 
            count={stats.system} 
            active={activeType === NotificationType.SYSTEM}
            onClick={() => onFilterChange(NotificationType.SYSTEM)} 
          />
          <SidebarLink 
            icon={User} 
            label="User Management" 
            count={stats.user} 
            active={activeType === NotificationType.USER}
            onClick={() => onFilterChange(NotificationType.USER)} 
          />
          <SidebarLink 
            icon={Building} 
            label="Facility" 
            count={stats.facility} 
            active={activeType === NotificationType.FACILITY}
            onClick={() => onFilterChange(NotificationType.FACILITY)} 
          />
        </div>
      </Card>
        </div>
      </Card>

      <Card className="rounded-xl border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">Recent Activity</h3>
        <div className="space-y-4">
          {notifications.slice(0, 3).map((n) => {
            const Icon = notificationIcons[n.type];
            return (
              <div key={n.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{n.message}</p>
                  <p className="text-[10px] text-slate-400">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100">
          <Button variant="ghost" className="w-full text-xs text-green-800 hover:bg-green-50 hover:text-green-900 font-medium">
            <ExternalLink className="mr-2 h-3 w-3" /> View all activity
          </Button>
        </div>
      </Card>
    </div>
  );
}