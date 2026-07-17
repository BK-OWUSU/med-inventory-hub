import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationSidebar } from "@/components/notifications/notification-sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { mockNotifications } from "@/lib/constants/data/mock-notifications";
import { ChevronDown, SlidersHorizontal, Search } from "lucide-react"; // Added Search icon

export default async function NotificationsPage() {
  const notifications = mockNotifications;

  return (
    <div className="w-full p-6 lg:p-10">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated with important alerts and activities.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Mark all as read</Button>
          <Button className="bg-green-900 hover:bg-green-800 text-white">Notification Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        <div className="col-span-12 lg:col-span-4 xl:col-span-3">
          <NotificationSidebar />
        </div>

        <div className="col-span-12 lg:col-span-8 xl:col-span-9">
          <Card className="shadow-none border-slate-200">
            {/* Header with Search, Sort and Filter */}
            <div className="p-4 border-b flex items-center justify-between gap-4">
              
              {/* Title Section */}
              <h2 className="font-semibold text-slate-900 whitespace-nowrap">
                All Notifications 
                <span className="text-green-800 bg-green-50 px-2 py-0.5 rounded text-xs ml-2">
                  12
                </span>
              </h2>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search notifications..." 
                  className="pl-9 h-9"
                />
              </div>

              {/* Right Side Controls */}
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" className="h-9 gap-2 text-sm">
                  Sort by: <span className="font-semibold">Newest</span> 
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>

            </div>
            
            <div className="divide-y">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}