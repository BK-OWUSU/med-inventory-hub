"use client"
import { 
  Plus, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Pill, 
  Edit2, 
  MoreVertical, 
  ArrowUpDown, 
  Link2,
  ChevronLeft,
  ChevronRight
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
import { useState } from "react"
import { AppSheet } from "@/components/custom/drawers/AppSheet"
import AddDrugCategoryForm from "./DrugCategoryForm"

// Type matches the database schema structure we designed earlier
interface DrugCategoryTableRow {
  id: string
  name: string
  description: string
  drugsCount: number
  status: "Active" | "Inactive"
  createdAt: string
}

const MOCK_CATEGORIES_DATA: DrugCategoryTableRow[] = [
  { id: "1", name: "Antibiotics", description: "Medicines used to treat bacterial infections.", drugsCount: 56, status: "Active", createdAt: "May 10, 2024" },
  { id: "2", name: "Analgesics", description: "Pain relief medicines.", drugsCount: 34, status: "Active", createdAt: "Apr 28, 2024" },
  { id: "3", name: "Anti-inflammatory", description: "Reduce inflammation and relieve pain.", drugsCount: 22, status: "Active", createdAt: "Apr 22, 2024" },
  { id: "4", name: "Antipyretics", description: "Reduce fever and lower body temperature.", drugsCount: 18, status: "Active", createdAt: "Apr 20, 2024" },
  { id: "5", name: "Antihistamines", description: "Used to treat allergies and allergic reactions.", drugsCount: 15, status: "Active", createdAt: "Apr 15, 2024" },
  { id: "6", name: "Cardiovascular", description: "Medicines for heart and blood vessel conditions.", drugsCount: 28, status: "Active", createdAt: "Apr 10, 2024" },
  { id: "7", name: "Respiratory", description: "Medicines for respiratory system conditions.", drugsCount: 24, status: "Active", createdAt: "Apr 5, 2024" },
  { id: "8", name: "Vitamins & Supplements", description: "Vitamins and nutritional supplements.", drugsCount: 30, status: "Active", createdAt: "Mar 28, 2024" },
  { id: "9", name: "Dermatological", description: "Medicines for skin and related conditions.", drugsCount: 12, status: "Inactive", createdAt: "Mar 20, 2024" },
  { id: "10", name: "Gastrointestinal", description: "Medicines for stomach and intestinal disorders.", drugsCount: 19, status: "Active", createdAt: "Mar 15, 2024" },
]

export default function DrugCategoriesPage() {

    const [isAddDrugCategoryDrawerOpen, setIsAddDrugCategoryDrawerOpen] = useState(false);


  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* Top Header Row Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Drug Categories</h1>
          <p className="text-sm text-slate-500 font-normal">
            Manage drug categories used to organize medicines in the system.
          </p>
        </div>
        <Button
          onClick={()=> setIsAddDrugCategoryDrawerOpen(true)} 
          className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs h-9 rounded-lg gap-1.5 self-start sm:self-auto px-4 shadow-xs">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Top Metrics Cards Layout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Total Categories */}
        <Card className="bg-white border-slate-100 shadow-xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl">
              <Tag className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Total Categories</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">12</p>
              <p className="text-[11px] text-slate-400 font-normal">All drug categories</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Categories */}
        <Card className="bg-white border-slate-100 shadow-xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50/60 text-emerald-700 border border-emerald-100/40 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Active Categories</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">11</p>
              <p className="text-[11px] text-slate-400 font-normal">Currently active</p>
            </div>
          </CardContent>
        </Card>

        {/* Inactive Categories */}
        <Card className="bg-white border-slate-100 shadow-xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl">
              <XCircle className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Inactive Categories</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">1</p>
              <p className="text-[11px] text-slate-400 font-normal">Currently inactive</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Drugs */}
        <Card className="bg-white border-slate-100 shadow-xs rounded-xl">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50/60 text-emerald-700 border border-emerald-100/40 rounded-xl">
              <Pill className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 font-medium">Total Drugs</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900">248</p>
              <p className="text-[11px] text-slate-400 font-normal">Across all categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Interface Workspace Section */}
      <Card className="bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">
                  <div className="flex items-center gap-1 cursor-pointer select-none hover:text-slate-700">
                    Category Name <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Description</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Drugs Count</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4">
                  <div className="flex items-center gap-1 cursor-pointer select-none hover:text-slate-700">
                    Created At <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 h-11 px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CATEGORIES_DATA.map((row) => (
                <TableRow key={row.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                  
                  {/* Category Name */}
                  <TableCell className="py-3 px-4 text-sm font-medium text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 bg-emerald-50 text-emerald-700 border border-emerald-100/40 rounded-md">
                        <Link2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-slate-800">{row.name}</span>
                    </div>
                  </TableCell>

                  {/* Description */}
                  <TableCell className="py-3 px-4 text-sm font-normal text-slate-500 max-w-sm truncate">
                    {row.description}
                  </TableCell>

                  {/* Drugs Count */}
                  <TableCell className="py-3 px-4 text-sm text-slate-600 font-medium">
                    {row.drugsCount}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="py-3 px-4 text-sm">
                    {row.status === "Active" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100/50">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Inactive
                      </span>
                    )}
                  </TableCell>

                  {/* Created At Date */}
                  <TableCell className="py-3 px-4 text-sm font-medium text-slate-500">
                    {row.createdAt}
                  </TableCell>

                  {/* Interactive Option Action Menu */}
                  <TableCell className="py-3 px-4 text-sm text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-800">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 rounded-lg hover:bg-slate-100">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-lg w-36">
                          <DropdownMenuItem className="text-xs cursor-pointer">View Products</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs cursor-pointer">Toggle Status</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs cursor-pointer text-rose-600 focus:text-rose-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Contextual Footer Pagination Layout Toolbar */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <p className="text-xs text-slate-500 font-normal">
            Showing <span className="font-semibold text-slate-700">1</span> to <span className="font-semibold text-slate-700">10</span> of <span className="font-semibold text-slate-700">12</span> categories
          </p>
          
          <div className="flex items-center gap-5 self-end sm:self-auto">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="h-8 text-xs font-semibold bg-white border-slate-200 rounded-lg w-16 px-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="min-w-16 rounded-lg">
                  <SelectItem value="10" className="text-xs">10</SelectItem>
                  <SelectItem value="20" className="text-xs">20</SelectItem>
                  <SelectItem value="50" className="text-xs">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-slate-400 font-normal">per page</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 text-slate-500 rounded-lg bg-white disabled:opacity-40" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="h-8 w-8 text-xs font-bold p-0 rounded-lg bg-emerald-800 text-white hover:bg-emerald-800 hover:text-white">
                1
              </Button>
              <Button variant="outline" className="h-8 w-8 text-xs font-semibold p-0 rounded-lg bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
                2
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200 text-slate-500 rounded-lg bg-white">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <AppSheet
      isOpen={isAddDrugCategoryDrawerOpen}
      onClose={() => setIsAddDrugCategoryDrawerOpen(false)}
      title="Edit Reward Perk or Drug Category"
      description="Customize a physical product, voucher item, drug category, or custom service milestone incentive for your loyalty catalog."
      maxWidth="lg"
      >
       <AddDrugCategoryForm/>
      </AppSheet>
    </div>
  )
}