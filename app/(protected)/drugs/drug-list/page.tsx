"use client"

import * as React from "react"
import { 
  Pill, 
  Plus, 
  RefreshCw, 
  ShieldAlert, 
  Layers, 
  Clock, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

interface MetricsCardProps {
  title: string
  value: string | number
  subtext: string
  trend: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}

function MetricCard({ title, value, subtext, trend, icon: Icon, iconBg, iconColor }: MetricsCardProps) {
  return (
    <Card className="bg-white border border-slate-100 shadow-xs rounded-2xl overflow-hidden w-full">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="space-y-0.5">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
            <p className="text-xs text-slate-400 font-normal">{subtext}</p>
          </div>
          <div className="pt-1">
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50/60 px-2 py-0.5 rounded-md border border-emerald-100/50">
              {trend}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">vs last month</span>
          </div>
        </div>
        <div className={`p-4 rounded-full ${iconBg} ${iconColor} shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function DrugManagementPage() {
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const sampleDrugs = [
    { name: "Amoxicillin Capsule", generic: "Amoxicillin", strength: "500mg", form: "Capsule", cat: "Antibiotics", unit: "Capsule", controlled: false, status: "Active", date: "May 12, 2024" },
    { name: "Paracetamol Tablet", generic: "Paracetamol", strength: "500mg", form: "Tablet", cat: "Analgesics", unit: "Tablet", controlled: false, status: "Active", date: "May 10, 2024" },
    { name: "Diclofenac Tablet", generic: "Diclofenac Sodium", strength: "50mg", form: "Tablet", cat: "Anti-inflammatory", unit: "Tablet", controlled: false, status: "Active", date: "May 08, 2024" },
    { name: "Tramadol Capsule", generic: "Tramadol HCl", strength: "50mg", form: "Capsule", cat: "Analgesics", unit: "Capsule", controlled: true, status: "Active", date: "May 06, 2024" },
    { name: "Cefuroxime Tablet", generic: "Cefuroxime Axetil", strength: "250mg", form: "Tablet", cat: "Antibiotics", unit: "Tablet", controlled: false, status: "Inactive", date: "May 05, 2024" },
    { name: "Metronidazole Tablet", generic: "Metronidazole", strength: "400mg", form: "Tablet", cat: "Antiprotozoals", unit: "Tablet", controlled: false, status: "Active", date: "May 03, 2024" },
    { name: "Salbutamol Syrup", generic: "Salbutamol", strength: "2mg/5ml", form: "Syrup", cat: "Respiratory", unit: "Bottle", controlled: false, status: "Active", date: "May 01, 2024" },
    { name: "Diazepam Tablet", generic: "Diazepam", strength: "5mg", form: "Tablet", cat: "Sedatives", unit: "Tablet", controlled: true, status: "Active", date: "Apr 28, 2024" },
  ]

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 600)
  }

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* 1. Header Section Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Drug Management</h1>
          <p className="text-sm text-slate-500 font-normal">
            Manage all medicines available in the central drug catalogue.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 rounded-lg border-slate-200 bg-white hover:bg-slate-50 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <Button 
            className="h-9 gap-1.5 px-4 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" /> Add Drug
          </Button>
        </div>
      </div>

      {/* 2. Summary Statistics Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        <MetricCard
          title="Total Drugs"
          value="1,248"
          subtext="All medicines"
          trend="↑ 12.5%"
          icon={Pill}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <MetricCard
          title="Controlled Drugs"
          value="156"
          subtext="Requires special license"
          trend="↑ 8.2%"
          icon={ShieldAlert}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <MetricCard
          title="Drug Categories"
          value="78"
          subtext="Total categories"
          trend="↑ 3.6%"
          icon={Layers}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
        <MetricCard
          title="Recently Added"
          value="24"
          subtext="In last 30 days"
          trend="↑ 20.0%"
          icon={Clock}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />
      </div>

      {/* 3. Central Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden p-4">
        
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4">Drug Name</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4">Generic Name</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4">Strength</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4">Dosage Form</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4">Category</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4">Unit</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4">Controlled</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4">Status</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4">Created Date</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs h-11 px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleDrugs.map((drug, index) => {
                const isControlled = drug.controlled
                const isActive = drug.status === "Active"
                
                return (
                  <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors duration-150">
                    <TableCell className="py-3 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 rounded-lg">
                          <Pill className="h-3.5 w-3.5" />
                        </div>
                        {drug.name}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-500 font-normal">{drug.generic}</TableCell>
                    <TableCell className="py-3 px-4 font-mono text-xs text-slate-600">{drug.strength}</TableCell>
                    <TableCell className="py-3 px-4 text-slate-600">{drug.form}</TableCell>
                    <TableCell className="py-3 px-4 text-emerald-700 font-medium">{drug.cat}</TableCell>
                    <TableCell className="py-3 px-4 text-slate-500">{drug.unit}</TableCell>
                    <TableCell className="py-3 px-4">
                      <Badge 
                        variant="outline" 
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-none tracking-wide ${
                          isControlled 
                            ? "bg-orange-50 text-orange-700 border-orange-200/50" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-200/40"
                        }`}
                      >
                        {isControlled ? "Controlled" : "Regular"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className={`text-xs font-semibold ${isActive ? "text-slate-700" : "text-slate-400"}`}>
                          {drug.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-slate-400 text-xs">{drug.date}</TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border border-slate-200 shadow-md">
                          <DropdownMenuItem className="text-xs cursor-pointer">View Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs cursor-pointer">Edit Record</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* 4. Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 text-slate-500 text-xs">
          <div>Showing 1 to 10 of 1,248 results</div>
          
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="flex items-center gap-2">
              <span>per page</span>
              <Select defaultValue="10">
                <SelectTrigger className="h-8 w-16 border-slate-200 rounded-lg text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10" className="text-xs">10</SelectItem>
                  <SelectItem value="25" className="text-xs">25</SelectItem>
                  <SelectItem value="50" className="text-xs">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 bg-white" disabled>
                <ChevronLeft className="h-4 w-4 text-slate-500" />
              </Button>
              <Button className="h-8 w-8 text-xs font-semibold bg-emerald-800 text-white rounded-lg hover:bg-emerald-700">1</Button>
              <Button variant="ghost" className="h-8 w-8 text-xs text-slate-600 rounded-lg">2</Button>
              <Button variant="ghost" className="h-8 w-8 text-xs text-slate-600 rounded-lg">3</Button>
              <Button variant="ghost" className="h-8 w-8 text-xs text-slate-600 rounded-lg">4</Button>
              <Button variant="ghost" className="h-8 w-8 text-xs text-slate-600 rounded-lg">5</Button>
              <span className="text-slate-300 px-1">...</span>
              <Button variant="ghost" className="h-8 w-8 text-xs text-slate-600 rounded-lg">125</Button>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-slate-200 bg-white">
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}