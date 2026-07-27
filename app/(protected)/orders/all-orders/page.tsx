"use client";

import * as React from "react";
import { 
  FileText, 
  Hourglass, 
  CheckCircle2, 
  Package, 
  FileCheck, 
  XCircle,
  Info, 
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import TableMain from "@/components/custom/table/TableMain";
import { useOrderStore } from "@/store/order.store";
import { allOrdersColumns, AllOrdersTableMeta } from "@/components/columnDef/orders/AllOrdersColumnDef";
import { AppSheet } from "@/components/custom/drawers/AppSheet";
import { OrderWithRelations } from "@/types/types/orders.type";
import OrderDetails from "@/components/viewDetailsCompoents/orders/OrderDetailsViewer";
import OrderReview from "@/components/viewDetailsCompoents/orders/OrderReviewerComponent";


export default function AllOrdersPage() {
  const { isLoading, fetchOrders, orders } = useOrderStore();
  const [showAlert, setShowAlert] = React.useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithRelations | null>(null);
  const [isViewOderViewerOpen, setIsViewOderViewerOpen] = React.useState<boolean>(false);
  const [isReviewOderViewerOpen, setIsReviewOderViewerOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Dynamically compute metric counts from the actual store data
  const metrics = React.useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const approved = orders.filter((o) => o.status === "APPROVED").length;
    const shipped = orders.filter(
      (o) => o.status === "SHIPPED" || o.status === "PARTIALLY_FULFILLED"
    ).length;
    const completed = orders.filter(
      (o) => o.status === "COMPLETED"
    ).length;
    const cancelled = orders.filter(
      (o) => o.status === "CANCELLED" || o.status === "REJECTED"
    ).length;

    return { total, pending, approved, shipped, completed, cancelled };
  }, [orders]);

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen font-sans">
      
      {/* Top Header & Alert Banner Area */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Orders</h1>
          <p className="text-xs text-slate-500 mt-1">View and manage all orders across your facility.</p>
        </div>

        {showAlert && (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-3 max-w-md shadow-xs">
            <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-emerald-900 block">About All Orders</span>
              <span className="text-emerald-700 leading-relaxed">A complete list of all stock requests and shipments.</span>
            </div>
            <button 
              onClick={() => setShowAlert(false)}
              className="text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Metric Summary Cards Grid (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Card 1 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Total Orders</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.total}</div>
              <p className="text-[10px] text-slate-400">All time</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Pending</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.pending}</div>
              <p className="text-[10px] text-slate-400">All time</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Hourglass className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Approved</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.approved}</div>
              <p className="text-[10px] text-slate-400">All time</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Shipped / In Transit</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.shipped}</div>
              <p className="text-[10px] text-slate-400">All time</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 5 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Completed</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.completed}</div>
              <p className="text-[10px] text-slate-400">All time</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 6 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Cancelled</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.cancelled}</div>
              <p className="text-[10px] text-slate-400">All time</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Content Card (Table & Pagination) */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden w-full">
        <TableMain
          columns={allOrdersColumns}
          data={orders}
          loading={isLoading}
          tableFilterButtonVisible={true}
          columnVisibilityFilter={true}
          searchKey="customId" 
          placeholder="Search order..."
          meta={{
            onViewDetails(order) {
              setSelectedOrder(order);
              setIsViewOderViewerOpen(true);
            },
            onReviewOrder(order) {
              setSelectedOrder(order);
              setIsReviewOderViewerOpen(true);
            },
          } as AllOrdersTableMeta}
        />
      </Card>

      <AppSheet
        isOpen={isViewOderViewerOpen}
        maxWidth="xl"
        onClose={() => setIsViewOderViewerOpen(false)}
        title={`View Order #${selectedOrder?.customId || ''}`}
        description="Overview of items, pricing, and fulfillment status."
      >
        {selectedOrder && (<OrderDetails order={selectedOrder}/>)}
      </AppSheet>

      <AppSheet
        isOpen={isReviewOderViewerOpen}
        maxWidth="xl"
        onClose={() => setIsReviewOderViewerOpen(false)}
        title={`Review Order #${selectedOrder?.customId || ''}`}
        description="Inspect request details before making an approval decision."
      >
        {selectedOrder && (
          <OrderReview 
            order={selectedOrder}
            onSuccess={() => {
              fetchOrders();
              setIsReviewOderViewerOpen(false);
            }}
         />)}
      </AppSheet>
    </div>
  );
}