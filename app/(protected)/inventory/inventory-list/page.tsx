"use client"

import * as React from "react"
import { 
  Plus, 
  Download, 
  Boxes, 
  Layers, 
  AlertTriangle, 
  CalendarClock, 
  Eye, 
  MoreVertical, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Pill,
  MapPin,
  X,
  History,
  CheckCircle2,
  TrendingUp
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Static mock array utilizing the shape of your Prisma Inferred helper types
const MOCK_INVENTORY: any[] = [
  { id: "inv-1", batchNumber: "AMX500-2405", manufacturer: "GSK", availableQuantity: 250, minStockLevel: 50, unitPrice: 12.50, expiryDate: "15 May 2025", status: "Expiring Soon", lastUpdated: "May 12, 2024 10:30 AM", drug: { name: "Amoxicillin 500mg", dosageForm: "Capsule" }, facility: { name: "Koforidua Central Pharmacy" } },
  { id: "inv-2", batchNumber: "PAR500-2406", manufacturer: "Medochemie", availableQuantity: 1200, minStockLevel: 100, unitPrice: 8.00, expiryDate: "20 Aug 2025", status: "In Stock", lastUpdated: "May 11, 2024 03:15 PM", drug: { name: "Paracetamol 500mg", dosageForm: "Tablet" }, facility: { name: "Koforidua Central Pharmacy" } },
  { id: "inv-3", batchNumber: "CEF250-2404", manufacturer: "Sandoz", availableQuantity: 45, minStockLevel: 50, unitPrice: 15.00, expiryDate: "30 Jun 2025", status: "Low Stock", lastUpdated: "May 10, 2024 09:45 AM", drug: { name: "Cefuroxime 250mg", dosageForm: "Tablet" }, facility: { name: "Koforidua Central Pharmacy" } },
  { id: "inv-4", batchNumber: "MET400-2403", manufacturer: "Beximco", availableQuantity: 80, minStockLevel: 30, unitPrice: 9.50, expiryDate: "10 Jul 2025", status: "In Stock", lastUpdated: "May 10, 2024 09:30 AM", drug: { name: "Metronidazole 400mg", dosageForm: "Tablet" }, facility: { name: "Koforidua Central Pharmacy" } },
  { id: "inv-5", batchNumber: "SALB-2406", manufacturer: "Cipla", availableQuantity: 60, minStockLevel: 20, unitPrice: 18.00, expiryDate: "12 Sep 2025", status: "In Stock", lastUpdated: "May 09, 2024 02:20 PM", drug: { name: "Salbutamol Syrup 2mg/5ml", dosageForm: "Syrup" }, facility: { name: "Koforidua Central Pharmacy" } },
  { id: "inv-6", batchNumber: "DIC50-2402", manufacturer: "AbdiK", availableQuantity: 15, minStockLevel: 30, unitPrice: 6.00, expiryDate: "05 Apr 2025", status: "Expired", lastUpdated: "May 09, 2024 11:05 AM", drug: { name: "Diclofenac 50mg", dosageForm: "Tablet" }, facility: { name: "Koforidua Central Pharmacy" } },
]

export default function InventoryPage() {
  const [selectedItem, setSelectedItem] = React.useState<any | null>(MOCK_INVENTORY[0])

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* Top Header Layout Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500 font-normal">View and manage all medicines in stock.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200 text-slate-700 font-medium text-xs h-9 rounded-lg gap-1.5 px-3.5 bg-white">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs h-9 rounded-lg gap-1.5 px-4 shadow-xs">
            <Plus className="h-4 w-4" /> Add Inventory
          </Button>
        </div>
      </div>

      {/* Top Aggregates Metrics Panel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Total Stock Items */}
        <Card className="bg-white border-slate-100 shadow-xs rounded-xl">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl">
                <Boxes className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500 font-medium">Total Stock Items</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900">1,248</p>
                <p className="text-[11px] text-slate-400 font-normal">Across all batches</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 pt-0.5 border-t border-slate-50">
              <TrendingUp className="h-3 w-3" /> 8.5% <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Quantity */}
        <Card className="bg-white border-slate-100 shadow-xs rounded-xl">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50/60 text-emerald-700 border border-emerald-100/40 rounded-xl">
                <Layers className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500 font-medium">Total Quantity</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900">15,842</p>
                <p className="text-[11px] text-slate-400 font-normal">Units in stock</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 pt-0.5 border-t border-slate-50">
              <TrendingUp className="h-3 w-3" /> 12.3% <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="bg-white border-slate-100 shadow-xs rounded-xl">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-700 border border-amber-100/40 rounded-xl">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500 font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900">86</p>
                <p className="text-[11px] text-slate-400 font-normal">Below min. level</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 pt-0.5 border-t border-slate-50">
              <TrendingUp className="h-3 w-3" /> 5.2% <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card className="bg-white border-slate-100 shadow-xs rounded-xl">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100/40 rounded-xl">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500 font-medium">Expiring Soon</p>
                <p className="text-2xl font-bold tracking-tight text-slate-900">42</p>
                <p className="text-[11px] text-slate-400 font-normal">Within 60 days</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600 pt-0.5 border-t border-slate-50">
              <TrendingUp className="h-3 w-3" /> 4.1% <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Workspace Layout Row containing Table and Side Drawer Panel Details */}
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
        
        {/* Main Database Table Workspace */}
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden flex-1 w-full">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/70 border-b border-slate-100">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">
                    <div className="flex items-center gap-1 cursor-pointer select-none hover:text-slate-700">
                      Drug / Strength / Form <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Batch Number</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Manufacturer</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Available Qty</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Min. Level</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Unit Price</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Expiry Date</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Last Updated</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_INVENTORY.map((row) => {
                  const isSelected = selectedItem?.id === row.id
                  return (
                    <TableRow 
                      key={row.id} 
                      className={`border-b border-slate-100 cursor-pointer transition-colors ${
                        isSelected ? "bg-emerald-50/30 hover:bg-emerald-50/40" : "hover:bg-slate-50/40"
                      }`}
                      onClick={() => setSelectedItem(row)}
                    >
                      {/* Drug Profile Metadata */}
                      <TableCell className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-800 tracking-tight">{row.drug.name}</p>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200/50">
                            {row.drug.dosageForm}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-xs font-mono text-slate-600 font-medium">{row.batchNumber || "-"}</TableCell>
                      <TableCell className="py-3 px-4 text-sm font-normal text-slate-500">{row.manufacturer || "-"}</TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-800 font-semibold">{row.availableQuantity}</TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-400 font-normal">{row.minStockLevel}</TableCell>
                      <TableCell className="py-3 px-4 text-sm text-slate-800 font-medium">GH₵ {row.unitPrice?.toFixed(2)}</TableCell>
                      <TableCell className="py-3 px-4 text-sm font-medium text-slate-600">{row.expiryDate || "-"}</TableCell>
                      
                      {/* Threshold Context Status Badges */}
                      <TableCell className="py-3 px-4 text-sm">
                        {row.status === "In Stock" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                            In Stock
                          </span>
                        )}
                        {row.status === "Low Stock" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100/50">
                            Low Stock
                          </span>
                        )}
                        {row.status === "Expiring Soon" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100/50">
                            Expiring Soon
                          </span>
                        )}
                        {row.status === "Expired" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Expired
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-4 text-xs font-normal text-slate-400 whitespace-nowrap">{row.lastUpdated}</TableCell>

                      <TableCell className="py-3 px-4 text-sm text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 rounded-lg hover:bg-slate-100" onClick={() => setSelectedItem(row)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 rounded-lg hover:bg-slate-100">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-lg w-36">
                              <DropdownMenuItem className="text-xs cursor-pointer">Update Stock</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs cursor-pointer">View Movements</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <p className="text-xs text-slate-500 font-normal">
              Showing <span className="font-semibold text-slate-700">1</span> to <span className="font-semibold text-slate-700">6</span> of <span className="font-semibold text-slate-700">1,248</span> results
            </p>
            
            <div className="flex items-center gap-5 self-end sm:self-auto">
              <div className="flex items-center gap-2">
                <Select defaultValue="10">
                  <SelectTrigger className="h-8 text-xs font-semibold bg-white border-slate-200 rounded-lg w-16 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[4rem] rounded-lg">
                    <SelectItem value="10" className="text-xs">10</SelectItem>
                    <SelectItem value="20" className="text-xs">20</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-slate-400 font-normal">per page</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 text-slate-500 rounded-lg bg-white disabled:opacity-40" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="h-8 w-8 text-xs font-bold p-0 rounded-lg bg-emerald-800 text-white hover:bg-emerald-800 hover:text-white">1</Button>
                <Button variant="outline" className="h-8 w-8 text-xs font-semibold p-0 rounded-lg bg-white border-slate-200 text-slate-600 hover:bg-slate-50">2</Button>
                <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 text-slate-500 rounded-lg bg-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Inventory Detailed Context Sidebar Drawer panel */}
        {selectedItem && (
          <Card className="w-full xl:w-80 bg-white border border-slate-200/80 shadow-sm rounded-xl overflow-hidden shrink-0">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Inventory Details</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600 rounded-md" onClick={() => setSelectedItem(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-5 space-y-5 text-sm">
              {/* Product Card Head Title */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="p-2 bg-emerald-600 text-white rounded-lg mt-0.5 shrink-0">
                  <Pill className="h-4 w-4" />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <p className="font-bold text-slate-900 truncate leading-tight">{selectedItem.drug.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/30 rounded">In Stock</span>
                    <span className="text-[11px] text-slate-400 font-mono truncate">{selectedItem.batchNumber}</span>
                  </div>
                </div>
              </div>

              {/* Stock Summary Metrics Group */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Summary</h4>
                <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-white">
                  <div className="flex justify-between items-center text-xs"><span className="text-slate-500 font-normal">Available Quantity</span><span className="font-bold text-slate-800">{selectedItem.availableQuantity} Box</span></div>
                  <div className="flex justify-between items-center text-xs"><span className="text-slate-500 font-normal">Minimum Stock Level</span><span className="font-medium text-slate-600">{selectedItem.minStockLevel} Box</span></div>
                  <div className="flex justify-between items-center text-xs"><span className="text-slate-500 font-normal">Unit Price</span><span className="font-semibold text-slate-800">GH₵ {selectedItem.unitPrice?.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-50"><span className="text-slate-500 font-bold">Total Value</span><span className="font-bold text-emerald-800">GH₵ {(selectedItem.availableQuantity * selectedItem.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                </div>
              </div>

              {/* Batch Structural Information Layout */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Batch Information</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between"><span className="text-slate-400">Batch Number</span><span className="font-mono font-medium text-slate-700">{selectedItem.batchNumber}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Manufacturer</span><span className="font-medium text-slate-700">{selectedItem.manufacturer}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Expiry Date</span><span className="font-medium text-slate-700">{selectedItem.expiryDate}</span></div>
                </div>
              </div>

              {/* Geographical Mapping Location Block */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</h4>
                <div className="flex items-center gap-2 p-2 border border-slate-100 rounded-lg bg-slate-50/50 text-xs">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-600 truncate">{selectedItem.facility.name}</span>
                </div>
              </div>

              {/* Activity Timestamp Logging */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Activity</h4>
                <div className="space-y-1 text-xs text-slate-500">
                  <p>Last Updated: <span className="font-medium text-slate-700">{selectedItem.lastUpdated}</span></p>
                </div>
              </div>

              {/* CTA Custom Tool Row */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" className="flex-1 text-xs font-bold h-9 rounded-lg gap-1 border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
                  <History className="h-3.5 w-3.5" /> Movements
                </Button>
                <Button className="flex-1 text-xs font-bold h-9 rounded-lg bg-emerald-800 text-white hover:bg-emerald-700 shadow-xs">
                  Update Stock
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

    </div>
  )
}