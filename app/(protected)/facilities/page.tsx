"use client"

import * as React from "react"
import { LucideProps } from "lucide-react";
import { 
  Plus, 
  Building2, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  CalendarPlus 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import TableMain from "@/components/custom/table/TableMain"
import { AppSheet } from "@/components/custom/drawers/AppSheet"
import { facilityColumns, FacilityTableMeta } from "@/components/columnDef/facility/facilityColumnDef"
import AddFacilityForm from "./FacilityFormComponent"
import { useFacilityStore } from "@/store/facilityStore"
import { FacilityListResponse } from "@/types/types/facility.type";
import EditFacilityForm from "./EditFacilityForm";

export default function FacilitiesPage() {
  const { fetchFacilities, isLoading, facilities = [] } = useFacilityStore();
  const [isAddFacilityOpen, setIsAddFacilityOpen] = React.useState(false);
  const [isEditFacilityOpen, setIsEditFacilityOpen] = React.useState(false);
  const [selectedFacility, setSelectedFacility] = React.useState<FacilityListResponse["facilities"][number] | null>();

  // Calculate metrics dynamically
  const metrics = React.useMemo(() => {
    const total = facilities.length;
    const verified = facilities.filter(f => f.isVerified).length;
    const pending = facilities.filter(f => !f.isVerified).length;
    const inactive = facilities.filter(f => !f.isActive).length;

    const now = new Date();
    const newThisMonth = facilities.filter(f => {
        const date = new Date(f.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    const verifiedPercentage = total > 0 ? Math.round((verified / total) * 100) : 0;

    return { total, verified, pending, inactive, newThisMonth, verifiedPercentage };
  }, [facilities]);

  React.useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Facilities</h1>
          <p className="text-sm text-slate-500 font-normal">
            Manage all healthcare facilities registered on the platform.
          </p>
        </div>

        <Button
          onClick={() => setIsAddFacilityOpen(true)}
          className="h-9 gap-1.5 px-4 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs rounded-lg transition-colors duration-200"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" /> Add New Facility
        </Button>
      </div>

      {/* 2. Metrics Grid (Updated with Dynamic Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        <MetricCard title="Total Facilities" value={metrics.total.toString()} subtext="All registered" icon={Building2} />
        <MetricCard title="Verified" value={metrics.verified.toString()} subtext={`${metrics.verifiedPercentage}% of total`} icon={ShieldCheck} />
        <MetricCard title="Pending" value={metrics.pending.toString()} subtext="Awaiting approval" icon={Clock} />
        <MetricCard title="Inactive" value={metrics.inactive.toString()} subtext="Not active" icon={XCircle} />
       <MetricCard title="New This Month" value={metrics.newThisMonth.toString()} subtext={`Added ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`} icon={CalendarPlus}/>
      </div>

      {/* 3. Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4">
        <TableMain
          columns={facilityColumns}
          data={facilities}
          loading={isLoading}
          tableFilterButtonVisible={false}
          searchKey="name"
          columnVisibilityFilter={false}
          placeholder="Facility list..."
          meta={{
              onEdit(facility) {
                 fetchFacilities();
                 setIsEditFacilityOpen(true)
                 setSelectedFacility(facility)
             },
              
          } as FacilityTableMeta}
        />
      </div>
      
      {/* 4. Add Facility Sheet */}
      <AppSheet
        isOpen={isAddFacilityOpen}
        onClose={() => setIsAddFacilityOpen(false)}
        title="Add New Facility"
        description="Register a new healthcare facility and configure initial settings."
        maxWidth="lg"
      >
        <AddFacilityForm onSuccess={() => {
            fetchFacilities();
            setIsAddFacilityOpen(false);
        }} />
      </AppSheet>

      <AppSheet
        isOpen={isEditFacilityOpen}
        onClose={() => setIsEditFacilityOpen(false)}
        title="Add New Facility"
        description="Register a new healthcare facility and configure initial settings."
        maxWidth="lg"
      >
        {selectedFacility && (
          <EditFacilityForm
            facility = {selectedFacility}
            onSuccess={() => {
              fetchFacilities();
              setIsEditFacilityOpen(false);
        }} />
        )}
      </AppSheet>
    </div>
  )
}

export interface MetricCardType {
  title: string;
  value: string;
  icon: React.ComponentType<LucideProps>;
  subtext?: string;
}

// Simple Metric Card Component
function MetricCard({ title, value, subtext, icon:Icon   }: MetricCardType) {
  return (
    <Card className="bg-white border border-slate-100 shadow-xs rounded-xl">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-slate-500">
           <Icon className="h-4 w-4" />
           <span className="text-xs font-medium">{title}</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <p className="text-[11px] text-slate-400 font-normal">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  )
}