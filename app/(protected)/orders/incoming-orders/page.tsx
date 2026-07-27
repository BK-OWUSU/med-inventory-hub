"use client";

import * as React from "react";
import { 
  FileText, 
  ArrowLeftRight, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Info, 
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import TableMain from "@/components/custom/table/TableMain";
import { useOrderStore } from "@/store/order.store";
import { incomingOrdersColumns, OrderTableMeta } from "@/components/columnDef/orders/IncomingOrdersColumnDef";
import { OrderWithRelations } from "@/types/types/orders.type";
import { AppSheet } from "@/components/custom/drawers/AppSheet";
import OrderDetails from "@/components/viewDetailsCompoents/orders/OrderDetailsViewer";
import OrderReview from "@/components/viewDetailsCompoents/orders/OrderReviewerComponent";
import { receiveOrderAction } from "@/lib/actions/orders.actions";
import { toast } from "sonner";
import { ReceivedOrderItemsInput } from "@/types/schemas/order.schema";

export default function IncomingOrdersPage() {
  const { isLoading, incomingOrders, fetchIncomingOrders } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithRelations | null>(null);
  const [showAlert, setShowAlert] = React.useState<boolean>(true);
  const [isViewOderViewerOpen, setIsViewOderViewerOpen] = React.useState<boolean>(false);
  const [isReviewOderViewerOpen, setIsReviewOderViewerOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetchIncomingOrders();
  }, [fetchIncomingOrders]);

  // Dynamically compute metric counts from the actual store data
  const metrics = React.useMemo(() => {
    const total = incomingOrders.length;
    const pending = incomingOrders.filter((o) => o.status === "PENDING").length;
    const approved = incomingOrders.filter((o) => o.status === "APPROVED").length;
    const partiallyReceived = incomingOrders.filter(
      (o) => o.status === "PARTIALLY_FULFILLED" 
    ).length;
    const completed = incomingOrders.filter(
      (o) => o.status === "COMPLETED"
    ).length;

    return { total, pending, approved, partiallyReceived, completed };
  }, [incomingOrders]);

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen font-sans">
      
      {/* Top Header & Alert Banner Area */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Incoming Orders</h1>
          <p className="text-xs text-slate-500 mt-1">View and manage orders sent to your facility from other facilities.</p>
        </div>

        {showAlert && (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-3 max-w-md shadow-xs">
            <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-emerald-900 block">About Incoming Orders</span>
              <span className="text-emerald-700 leading-relaxed">These are stock requests sent to your facility. Review, approve and receive items.</span>
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

      {/* Metric Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Total Incoming Orders</p>
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
              <p className="text-[10px] text-amber-600 font-medium">Awaiting your action</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Approved</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.approved}</div>
              <p className="text-[10px] text-emerald-600 font-medium">Ready to be received</p>
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
              <p className="text-xs font-medium text-slate-500">Partially Received</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.partiallyReceived}</div>
              <p className="text-[10px] text-sky-600 font-medium">In progress</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 5 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Completed</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.completed}</div>
              <p className="text-[10px] text-slate-500">Successfully received</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Content Card (Tabs, Table & Pagination) */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden w-full">
        <TableMain
          columns={incomingOrdersColumns}
          data={incomingOrders}
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
          } as OrderTableMeta}
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
              fetchIncomingOrders();
              setIsReviewOderViewerOpen(false);
            }}
         />)}
      </AppSheet>
    </div>
  );
}