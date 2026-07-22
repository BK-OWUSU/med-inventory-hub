"use client";

import * as React from "react";
import { 
  Send, 
  Hourglass, 
  CheckCircle2, 
  Package, 
  FileCheck, 
  Info, 
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import TableMain from "@/components/custom/table/TableMain";
import { useOrderStore } from "@/store/order.store";
import { outgoingOrdersColumns, OutgoingOrderTableMeta } from "@/components/columnDef/orders/OutgoingOrdersColumnDef";
import { AppSheet } from "@/components/custom/drawers/AppSheet";
import UpdateOrderForm from "./UpdateOrderFormComponent";
import { OrderWithRelations } from "@/types/types/orders.type";

export default function OutgoingOrdersPage() {
  const {isLoading, outgoingOrders, fetchOutgoingOrders } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = React.useState<OrderWithRelations | null>();
  const [showAlert, setShowAlert] = React.useState<boolean>(true);
  const [isUpdateOderViewerOpen, seIsUpdateOderViewerOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetchOutgoingOrders();
  }, [fetchOutgoingOrders]);

  // Dynamically compute metric counts from the actual store data
  const metrics = React.useMemo(() => {
    const total = outgoingOrders.length;
    const pending = outgoingOrders.filter((o) => o.status === "PENDING").length;
    const approved = outgoingOrders.filter((o) => o.status === "APPROVED").length;
    const shipped = outgoingOrders.filter(
      (o) => o.status === "SHIPPED" || o.status === "PARTIALLY_FULFILLED"
    ).length;
    const completed = outgoingOrders.filter(
      (o) => o.status === "COMPLETED" || o.status === "RECEIVED" || o.status === "DELIVERED"
    ).length;

    return { total, pending, approved, shipped, completed };
  }, [outgoingOrders]);

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen font-sans">
      
      {/* Top Header & Alert Banner Area */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Outgoing Orders</h1>
          <p className="text-xs text-slate-500 mt-1">View and manage orders you have sent to other facilities.</p>
        </div>

        {showAlert && (
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-3 max-w-md shadow-xs">
            <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-emerald-900 block">About Outgoing Orders</span>
              <span className="text-emerald-700 leading-relaxed">Track the status of stock requests you have sent to other facilities.</span>
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
              <p className="text-xs font-medium text-slate-500">Total Outgoing Orders</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.total}</div>
              <p className="text-[10px] text-slate-400">All time</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Send className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-slate-200/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500">Pending</p>
              <div className="text-2xl font-bold text-slate-900">{metrics.pending}</div>
              <p className="text-[10px] text-amber-600 font-medium">Awaiting supplier response</p>
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
              <p className="text-[10px] text-emerald-600 font-medium">Approved by supplier</p>
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
              <p className="text-[10px] text-purple-600 font-medium">Stock on the way</p>
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
              <p className="text-[10px] text-slate-500">Successfully received</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Main Content Card (Table & Pagination) */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden w-full">
        <TableMain
          columns={outgoingOrdersColumns}
          data={outgoingOrders}
          loading={isLoading}
          tableFilterButtonVisible={true}
          columnVisibilityFilter={true}
          searchKey="customId" 
          placeholder="Search order..."
          meta={{
            onUpdateOrder(order) {
              seIsUpdateOderViewerOpen(true)
              setSelectedOrder(order)  
            },

          }as OutgoingOrderTableMeta}
        />
      </Card>
       <AppSheet
          isOpen={isUpdateOderViewerOpen}
          maxWidth="xl"
          onClose={() => seIsUpdateOderViewerOpen(false)}
          title="View Your Cart"
          description="Below are orders you have added to you cart"
        >
        {selectedOrder && (  
        <UpdateOrderForm
          order={selectedOrder}
          onSuccess={()=> {
            fetchOutgoingOrders()
            seIsUpdateOderViewerOpen(false)
          }}
        />
        )}
      </AppSheet>
    </div>
  );
}