"use client"
import { 
  Plus, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Pill, 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { useState } from "react"
import { AppSheet } from "@/components/custom/drawers/AppSheet"
import DrugCategoryFormComponent from "./DrugCategoryForm"
import { useDrugCategoryStore } from "@/store/drugCategory"
import React from "react"
import TableMain from "@/components/custom/table/TableMain"
import { drugCategoryColumns, DrugCategoryTableMeta } from "@/components/columnDef/drugs/drugCategoryColumnDef"
import { DrugCategoryWithCount } from "@/types/types/drugs.types"

export default function DrugCategoriesPage() {
  const { fetchCategories, categories, loading } = useDrugCategoryStore()

  const [isDrugCategoryDrawerOpen, setIsDrugCategoryDrawerOpen] = useState(false);
  const [selectedDrugCategory, setDrugSelectedCategory] = useState<DrugCategoryWithCount | null>(null)

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories])

  // === DYNAMIC METRICS CALCULATION FROM STORE STATE ===
  const totalCategoriesCount = categories.length
  
  const activeCategoriesCount = categories.filter(cat => cat.isActive).length
  
  const inactiveCategoriesCount = totalCategoriesCount - activeCategoriesCount
  
  const totalDrugsCount = categories.reduce((sum, currentCat) => {
    return sum + (currentCat._count?.drugs ?? 0)
  }, 0)

  // Helper handling safely opening drawer for a fresh entry
  const handleOpenAddCategory = () => {
    setDrugSelectedCategory(null) // Reset payload completely to switch form to creation mode
    setIsDrugCategoryDrawerOpen(true)
  }

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
          onClick={handleOpenAddCategory} 
          className="bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs h-9 rounded-lg gap-1.5 self-start sm:self-auto px-4 shadow-xs"
        >
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
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {loading ? "—" : totalCategoriesCount}
              </p>
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
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {loading ? "—" : activeCategoriesCount}
              </p>
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
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {loading ? "—" : inactiveCategoriesCount}
              </p>
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
              <p className="text-2xl font-bold tracking-tight text-slate-900">
                {loading ? "—" : totalDrugsCount}
              </p>
              <p className="text-[11px] text-slate-400 font-normal">Across all categories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Interface Workspace Section */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden p-4">
        <TableMain
          columns={drugCategoryColumns}
          data={categories}
          loading={loading}
          searchKey="name"
          tableFilterButtonVisible = {true}
          columnVisibilityFilter={true}
          placeholder="Search by medicine name..."
          meta={{
            onEditCategory(drugCategory) {
              setDrugSelectedCategory(drugCategory);
              setIsDrugCategoryDrawerOpen(true);
            },
            onDeleteCategory(drugCategory) {
              console.log("Triggering soft-delete pipeline for:", drugCategory.id)
              // TODO: Wire up your custom confirmation alert dialog or directly dispatch deactivation:
              // useDrugCategoryStore.getState().deleteCategory(drugCategory.id)
            },
            onRestoreCategory(drugCategory) {
              console.log("Triggering restoration pipeline for:", drugCategory.id)
              // TODO: Wire up restoration handler:
              // useDrugCategoryStore.getState().restoreCategory(drugCategory.id)
            }
          } as DrugCategoryTableMeta}
        />
      </div>

      {/* Slide-over Drawer containing Creation/Mutation Form */}
      <AppSheet
        isOpen={isDrugCategoryDrawerOpen}
        onClose={() => {
          setIsDrugCategoryDrawerOpen(false)
          setDrugSelectedCategory(null)
        }}
        title={selectedDrugCategory ? "Edit Drug Category" : "Add New Category"}
        description={
          selectedDrugCategory 
            ? "Update classification properties and adjust application visibility parameters."
            : "Create a database classification group for managing systemic drugs."
        }
        maxWidth="lg"
      >
        <DrugCategoryFormComponent
          initialData={
            selectedDrugCategory 
              ? {
                  id: selectedDrugCategory.id,
                  name: selectedDrugCategory.name,
                  description: selectedDrugCategory.description || undefined,
                  isActive: selectedDrugCategory.isActive
                }
              : undefined // Passing undefined forces form to use initialization default values
          }
          onSuccess={() => {
            setIsDrugCategoryDrawerOpen(false)
            fetchCategories();
            setDrugSelectedCategory(null)
          }}
        />
      </AppSheet>
    </div>
  )
}