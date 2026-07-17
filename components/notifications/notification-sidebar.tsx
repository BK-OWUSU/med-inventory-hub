import { 
  Bell, 
  AlertCircle, 
  ShoppingCart, 
  Package, 
  Calendar, 
  Settings, 
  User, 
  Building, 
  LucideIcon, 
  ExternalLink 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SidebarLinkProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
}

function SidebarLink({ icon: Icon, label, count, active }: SidebarLinkProps) {
  return (
    <button className={cn(
      "flex w-full items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
      active 
        ? "bg-green-50 text-green-900 font-medium" 
        : "text-slate-600 hover:bg-slate-50"
    )}>
      <div className="flex items-center gap-3">
        <Icon className={cn("h-4 w-4", active ? "text-green-800" : "text-slate-500")} />
        {label}
      </div>
      {count !== undefined && (
        <span className={cn("text-xs", active ? "text-green-800 font-bold" : "text-slate-400")}>
          {count}
        </span>
      )}
    </button>
  );
}

export function NotificationSidebar() {
  return (
    <div className="space-y-6 w-full">
      
      {/* Filter By Card */}
      <Card className="rounded-xl border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">Filter by</h3>
        <div className="space-y-0.5">
          <SidebarLink icon={Bell} label="All Notifications" count={12} active />
          <SidebarLink icon={AlertCircle} label="Unread" count={12} />
          <SidebarLink icon={ShoppingCart} label="Orders" count={4} />
          <SidebarLink icon={Package} label="Inventory & Stock" count={3} />
          <SidebarLink icon={Calendar} label="Expiries" count={2} />
          <SidebarLink icon={Settings} label="System" count={2} />
          <SidebarLink icon={User} label="User Management" count={1} />
          <SidebarLink icon={Building} label="Facility" count={0} />
        </div>
      </Card>

      {/* Recent Activity Card */}
      <Card className="rounded-xl border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 px-1">Recent Activity</h3>
        <div className="space-y-4">
          {/* Activity Item 1 */}
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
               <ShoppingCart className="h-4 w-4 text-green-800" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">New Order Request</p>
              <p className="text-[10px] text-slate-500 truncate">Korle Bu Teaching Hospital</p>
              <p className="text-[10px] text-slate-400">2 min ago</p>
            </div>
          </div>

          {/* Activity Item 2 */}
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
               <Package className="h-4 w-4 text-amber-700" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">Low Stock Alert</p>
              <p className="text-[10px] text-slate-500 truncate">Paracetamol 500mg</p>
              <p className="text-[10px] text-slate-400">15 min ago</p>
            </div>
          </div>

          {/* Activity Item 3 */}
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
               <User className="h-4 w-4 text-purple-700" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">New User Added</p>
              <p className="text-[10px] text-slate-500 truncate">Abena K. Owusu</p>
              <p className="text-[10px] text-slate-400">1 hour ago</p>
            </div>
          </div>
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