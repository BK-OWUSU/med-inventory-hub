"use client"

import * as React from "react"
import { 
  Pill, 
  Plus, 
  RefreshCw, 
  ShieldAlert, 
  Layers, 
  Clock, 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { useRouter } from "next/navigation"
import { useDrugStore } from "@/store/drugStore"
import TableMain from "@/components/custom/table/TableMain"
import { drugsColumns, DrugTableMeta } from "@/components/columnDef/drugColumnDef"
import { AppSheet } from "@/components/custom/drawers/AppSheet"
import { DrugDetails } from "@/components/viewDetailsCompoents/drugs/DrugDetailsViewer"
import { DrugWithCategory } from "@/types/types/drugs.types"
import EditDrugForm from "../add-drug/EditDrugForms"
import { useDrugCategoryStore } from "@/store/drugCategory"
import { useAuthStore } from "@/store/authStore"

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
  const { user } = useAuthStore();
  const { fetchDrugs, loading, drugs = [] } = useDrugStore();
  const { fetchCategories, categories = [] } = useDrugCategoryStore()
  const router = useRouter();
  
  const addDrugPath = "/drugs/add-drug";
  const handleAddDrugLink = () => {
    router.push(addDrugPath)
  }
  const facilityId = user?.facility?.id;  
  
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isDrugViewDetailsOpen, setIsDrugViewDetailsOpen] = React.useState(false);
  const [isEditDrugOpen, setIsEditDrawerDrugOpen] = React.useState(false);
  const [selectedDrug, setSelectedDrug] = React.useState<DrugWithCategory | null>();

  React.useEffect(() => {
    fetchDrugs();
    fetchCategories();
  }, [fetchCategories, fetchDrugs])

// ==========================================
  // DYNAMIC COMPUTATIONS & TREND CALCULATIONS
  // ==========================================
  const { totalDrugs, controlledDrugs, totalCategories, recentlyAddedDrugs, trends } = React.useMemo(() => {
    const safeDrugs = drugs || [];
    const safeCategories = categories || [];

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // Helper to format trend strings safely
    const getTrendString = (current: number, previous: number) => {
      if (previous === 0) {
        return current > 0 ? `+${current}` : "0%";
      }
      const diff = ((current - previous) / previous) * 100;
      const arrow = diff >= 0 ? "↑" : "↓";
      return `${arrow} ${Math.abs(diff).toFixed(1)}%`;
    };

    // 1. Total Catalog Growth Calculations
    const currentTotal = safeDrugs.length;
    const previousTotal = safeDrugs.filter(
      (d) => d.createdAt && new Date(d.createdAt) < thirtyDaysAgo
    ).length;
    const totalTrend = getTrendString(currentTotal, previousTotal);

    // 2. Controlled Drugs Growth
    const currentControlled = safeDrugs.filter((d) => d.isControlled).length;
    const previousControlled = safeDrugs.filter(
      (d) => d.isControlled && d.createdAt && new Date(d.createdAt) < thirtyDaysAgo
    ).length;
    const controlledTrend = getTrendString(currentControlled, previousControlled);

    // 3. Category Growth
    const currentCategories = safeCategories.length;
    const previousCategories = safeCategories.filter(
      (c) => c.createdAt && new Date(c.createdAt) < thirtyDaysAgo
    ).length;
    const categoriesTrend = getTrendString(currentCategories, previousCategories);

    // 4. Recently Added vs Previous 30 Days velocity
    // (Drugs added 0-30 days ago vs drugs added 31-60 days ago)
    const addedLast30 = safeDrugs.filter((d) => {
      if (!d.createdAt) return false;
      const created = new Date(d.createdAt);
      return created >= thirtyDaysAgo;
    }).length;

    const addedPrev30 = safeDrugs.filter((d) => {
      if (!d.createdAt) return false;
      const created = new Date(d.createdAt);
      return created >= sixtyDaysAgo && created < thirtyDaysAgo;
    }).length;
    const recentTrend = getTrendString(addedLast30, addedPrev30);

    return {
      totalDrugs: currentTotal,
      controlledDrugs: currentControlled,
      totalCategories: currentCategories,
      recentlyAddedDrugs: addedLast30,
      trends: {
        totalTrend,
        controlledTrend,
        categoriesTrend,
        recentTrend,
      }
    };
  }, [drugs, categories]);

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchDrugs(), fetchCategories()]);
    setIsRefreshing(false)
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
            disabled={isRefreshing || loading}
            className="h-9 w-9 rounded-lg border-slate-200 bg-white hover:bg-slate-50 shrink-0"
          >
            <RefreshCw className={`h-4 w-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={handleAddDrugLink} 
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
          value={totalDrugs.toLocaleString()}
          subtext="All medicines"
          trend={trends.totalTrend}
          icon={Pill}
          iconBg="bg-emerald-50/60"
          iconColor="text-emerald-700"
        />
        <MetricCard
          title="Controlled Drugs"
          value={controlledDrugs.toLocaleString()}
          subtext="Requires special license"
          trend={trends.controlledTrend}
          icon={ShieldAlert}
          iconBg="bg-emerald-50/60"
          iconColor="text-emerald-700"
        />
        <MetricCard
          title="Drug Categories"
          value={totalCategories.toLocaleString()}
          subtext="Total categories"
          trend={trends.categoriesTrend}
          icon={Layers}
          iconBg="bg-emerald-50/60"
          iconColor="text-emerald-700"
        />
        <MetricCard
          title="Recently Added"
          value={recentlyAddedDrugs.toLocaleString()}
          subtext="In last 30 days"
          trend={trends.recentTrend}
          icon={Clock}
          iconBg="bg-emerald-50/60"
          iconColor="text-emerald-700"
        />
      </div>

      {/* 3. Central Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4">
        <TableMain
          columns={drugsColumns}
          data={drugs}
          loading={loading}
          tableFilterButtonVisible = {true}
          searchKey="name"
          columnVisibilityFilter={true}
          placeholder="Search by medicine name..."
          meta={{
            onViewDrug(drug) {
              setIsDrugViewDetailsOpen(true);
              setSelectedDrug(drug);
            },
            onEditDrug(drug) {
              setIsEditDrawerDrugOpen(true)
              setSelectedDrug(drug);
            }
          } as DrugTableMeta}
        />
      </div>
      
      <AppSheet
        isOpen={isDrugViewDetailsOpen}
        onClose={() => setIsDrugViewDetailsOpen(false)}
        title="Drug Detail"
        description="View physical inventory profile, status configurations, and clinical specifications."
        maxWidth="lg"
      >
        <DrugDetails drug={selectedDrug || null} currentFacilityId={facilityId}/>
      </AppSheet>
      
      <AppSheet
        isOpen={isEditDrugOpen}
        onClose={() => setIsEditDrawerDrugOpen(false)}
        title="Edit Drug Entry"
        description="Modify existing medical catalogue data points, strengths, formulations, and metrics safely."
        maxWidth="lg"
      >
        {selectedDrug && (
          <EditDrugForm
            drug={selectedDrug} 
            categories={categories} 
            onSuccess={() => {
              fetchDrugs();
              setIsEditDrawerDrugOpen(false)
            }}
          />
        )}
      </AppSheet>
    </div>
  )
}