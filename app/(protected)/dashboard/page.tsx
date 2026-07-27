"use client";

import * as React from "react";
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronDown, 
  Plus, 
  ArrowDownLeft, 
  ShoppingCart, 
  SlidersHorizontal, 
  BarChart3, 
  ShieldCheck, 
  Clock,
  Building2,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

// Import Auth Store, Zustand Store & Components
import { useDashboardStore } from "@/store/useDashboardStore";

import type { OrderWithRelations } from "@/types/types/orders.type";
import TableMain from "@/components/custom/table/TableMain";
import { AppSheet } from "@/components/custom/drawers/AppSheet";
import OrderDetails from "@/components/viewDetailsCompoents/orders/OrderDetailsViewer";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { allDashboardOrdersColumns, AllOrdersTableMeta } from "@/components/columnDef/dashboard/AllOrdersColumnDef";

//TODO: to use acutal data
const inventoryTrendData = [
  { date: "09 May", stock: 52000 },
  { date: "10 May", stock: 75000 },
  { date: "11 May", stock: 105000 },
  { date: "12 May", stock: 74000 },
  { date: "13 May", stock: 112000 },
  { date: "14 May", stock: 98000 },
  { date: "15 May", stock: 128450 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { metrics, charts, lists, isLoading, error, fetchDashboard } = useDashboardStore();
  // Sheet and Modal States
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithRelations | null>(null);
  const [isViewOrderOpen, setIsViewOrderOpen] = React.useState(false);

  const router = useRouter();

  React.useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Format current date nicely
  const currentDate = new Intl.DateTimeFormat('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }).format(new Date());

  if (error) {
    return (
      <div className="p-6 text-xs text-rose-600 bg-slate-50 min-h-screen flex items-center justify-center">
        Error loading dashboard data: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen font-sans">
      
      {/* Enhanced Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.fullName || "User"} 👋
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold hidden md:inline-flex">
              <Sparkles className="h-3 w-3 mr-1 text-emerald-600" />
              {user?.role || "Staff"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <span>Here&apos;s your live inventory activity overview.</span>
            {user?.facility && (
              <>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center text-slate-600 font-medium">
                  <Building2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  {user.facility.name} ({user.facility.location})
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 shadow-2xs">
            <CalendarIcon className="h-4 w-4 text-emerald-700" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Top Metric Cards Grid (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Drugs */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Drugs</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{metrics.totalDrugs.toLocaleString()}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> +12.5%
                </span>
                <span className="text-[10px] text-slate-400">Across categories</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Inventory Value */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Inventory Value</span>
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">
                GH₵ {metrics.totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> +8.3%
                </span>
                <span className="text-[10px] text-slate-400">Facility valuation</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Low Stock Items */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Low Stock Items</span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{metrics.lowStockCount}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] font-semibold text-rose-600 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" /> -4.2%
                </span>
                <span className="text-[10px] text-slate-400">Require attention</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Expiring Soon */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Expiring Soon</span>
              <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{metrics.expiringCount}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] font-semibold text-rose-600 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-0.5" /> -2.1%
                </span>
                <span className="text-[10px] text-slate-400">Within 30 days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Pending Orders */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pending Orders</span>
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">{metrics.pendingOrdersCount}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> +5.6%
                </span>
                <span className="text-[10px] text-slate-400">Awaiting action</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Middle Grid: Charts & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Inventory Overview Chart (Span 5 cols) */}
        <Card className="lg:col-span-5 bg-white border border-slate-200/80 shadow-xs rounded-xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Inventory Overview</CardTitle>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg cursor-pointer">
              <span>Last 7 Days</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Total In Stock</span>
                <span className="text-xs font-bold text-slate-900">{metrics.totalInStock.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Stock In</span>
                <span className="text-xs font-bold text-emerald-600">+8,450</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Stock Out</span>
                <span className="text-xs font-bold text-rose-600">-6,230</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Adjustments</span>
                <span className="text-xs font-bold text-blue-600">+320</span>
              </div>
            </div>

            <div className="h-45 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inventoryTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#fff", borderColor: "#e2e8f0", borderRadius: "8px", fontSize: "11px" }} />
                  <Area type="monotone" dataKey="stock" stroke="#047857" strokeWidth={2} fillOpacity={1} fill="url(#colorStock)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                Average inventory value for the selected period.
              </p>
              <Button onClick={()=> router.push("/reports/inventory-report")} variant="outline" size="sm" className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-7">
                View Inventory Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Overview Donut Chart (Span 4 cols) */}
        <Card className="lg:col-span-4 bg-white border border-slate-200/80 shadow-xs rounded-xl flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Orders Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center relative">
              <div className="h-40 w-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.orderStatusData.length > 0 ? charts.orderStatusData : [{ name: "No Orders", value: 1, color: "#e2e8f0" }]}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(charts.orderStatusData.length > 0 ? charts.orderStatusData : [{ name: "No Orders", value: 1, color: "#e2e8f0" }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#fff", borderColor: "#e2e8f0", borderRadius: "8px", fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-bold text-slate-900">{metrics.totalOrdersCount}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Total Orders</span>
                </div>
              </div>

              <div className="space-y-1.5 ml-4 text-xs">
                {charts.orderStatusData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 text-[11px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 text-[11px]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button onClick={()=> router.push("/orders/all-orders")} variant="outline" size="sm" className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-7">
                View All Orders →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts (Span 3 cols) */}
        <Card className="lg:col-span-3 bg-white border border-slate-200/80 shadow-xs rounded-xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Low Stock Alerts</CardTitle>
            <span className="text-xs font-medium text-emerald-700 cursor-pointer hover:underline">View All</span>
          </CardHeader>
          <CardContent className="space-y-3">
            {lists.lowStock.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No low stock items right now.</p>
            ) : (
              lists.lowStock.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block">{item.drug?.name || "Unknown Drug"}</span>
                    <span className="text-[10px] text-slate-500">Current: <strong className="text-slate-700">{item.availableQuantity}</strong> | Min: {item.minStockLevel}</span>
                  </div>
                  <Badge onClick={()=> router.push("/inventory/inventory-list")} variant="outline" className="text-[9px] text-rose-700 border-rose-200 bg-rose-50 h-5 px-1.5 font-bold">
                    Low Stock
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>

      {/* Bottom Grid: Recent Orders, Expiring Soon, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Table Component (Span 8 cols) */}
        <Card className="lg:col-span-8 bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Recent Orders</CardTitle>
            </div>
            <span onClick={()=> router.push("/orders/all-orders")} className="text-xs font-medium text-emerald-700 cursor-pointer hover:underline">View All</span>
          </CardHeader>
          <CardContent className="p-0">
            <TableMain
              columns={allDashboardOrdersColumns}
              data={lists.recentOrders}
              loading={isLoading}
              tableFilterButtonVisible={true}
              columnVisibilityFilter={true}
              searchKey="customId" 
              placeholder="Search recent orders..."
              meta={{
                onViewDetails(order) {
                  setSelectedOrder(order);
                  setIsViewOrderOpen(true);
                },
              } as AllOrdersTableMeta}
            />
          </CardContent>
        </Card>

        {/* Right Stack: Expiring Soon & Quick Actions (Span 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Expiring Soon Card */}
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-slate-900">Expiring Soon</CardTitle>
              <span onClick={()=> router.push("/inventory/inventory-list")} className="text-xs font-medium text-emerald-700 cursor-pointer hover:underline">View All</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {lists.expiringSoon.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No items expiring soon.</p>
              ) : (
                lists.expiringSoon.map((item, idx) => {
                  const expiryDateStr = item.expiryDate 
                    ? new Date(item.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
                    : "N/A";
                  const [day, month] = expiryDateStr.split(' ');

                  return (
                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="bg-rose-50 border border-rose-100 rounded-md p-1.5 text-center shrink-0 w-12">
                        <span className="text-[9px] font-bold text-rose-600 block">{day}</span>
                        <span className="text-[10px] font-bold text-slate-800 block">{month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-900 block truncate">{item.drug?.name || "Drug Name"}</span>
                        <span className="text-[10px] text-slate-500 block">Batch: {item.batchNumber || "N/A"} • {item.facility?.name || "Facility"}</span>
                        <span className="text-[10px] font-bold text-rose-600 block mt-0.5">{item.availableQuantity} units</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2.5">
                <Button onClick={()=> router.push("/drugs/drug-list")} variant="outline" className="flex flex-col items-center justify-center h-16 p-2 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 group transition-all">
                  <Plus className="h-4 w-4 text-emerald-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700 group-hover:text-emerald-800">Add Drug</span>
                </Button>

                <Button onClick={()=> router.push("/inventory/inventory-list")} variant="outline" className="flex flex-col items-center justify-center h-16 p-2 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 group transition-all">
                  <ArrowDownLeft className="h-4 w-4 text-emerald-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700 group-hover:text-emerald-800">Receive Stock</span>
                </Button>

                <Button onClick={()=> router.push("/orders/browse-stock")} variant="outline" className="flex flex-col items-center justify-center h-16 p-2 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 group transition-all">
                  <ShoppingCart className="h-4 w-4 text-emerald-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700 group-hover:text-emerald-800">Create Order</span>
                </Button>

                <Button  onClick={()=> router.push("/inventory/adjustment-history")} variant="outline" className="flex flex-col items-center justify-center h-16 p-2 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 group transition-all">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700 group-hover:text-emerald-800">Stock Adjustment</span>
                </Button>

                <Button onClick={()=> router.push("/reports/inventory-report")} variant="outline" className="flex flex-col items-center justify-center h-16 p-2 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 group transition-all">
                  <BarChart3 className="h-4 w-4 text-emerald-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700 group-hover:text-emerald-800">View Reports</span>
                </Button>

                <Button onClick={()=> router.push("/audit-logs")} variant="outline" className="flex flex-col items-center justify-center h-16 p-2 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 group transition-all">
                  <ShieldCheck className="h-4 w-4 text-emerald-700 mb-1" />
                  <span className="text-[10px] font-medium text-slate-700 group-hover:text-emerald-800">Audit Logs</span>
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* View Order Sheet */}
      <AppSheet
        isOpen={isViewOrderOpen}
        maxWidth="xl"
        onClose={() => setIsViewOrderOpen(false)}
        title={`View Order #${selectedOrder?.customId || ''}`}
        description="Overview of items, pricing, and fulfillment status."
      >
        {selectedOrder && <OrderDetails order={selectedOrder} />}
      </AppSheet>
    </div>
  );
}