"use client"

import * as React from "react"
import { LucideProps } from "lucide-react"
import {
  Plus,
  User2,
  ShieldCheck,
  XCircle,
  UserCog,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import TableMain from "@/components/custom/table/TableMain"
import { AppSheet } from "@/components/custom/drawers/AppSheet"
import { userColumns, UserTableMeta } from "@/components/columnDef/drugs/userColumnDef"
import AddUserForm from "./AddUserForm"
import EditUserForm from "./EditUserForm"
import { useUserStore } from "@/store/userStore"
import { UserListResponse } from "@/types/types/user.types"
import { toggleUserStatus } from "@/lib/actions/user.action"
import { toast } from "sonner"

export default function UsersPage() {
  const { fetchUsers, isLoading, users = [] } = useUserStore()
  const [isAddUserOpen, setIsAddUserOpen] = React.useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<UserListResponse["users"][number] | null>(null)
  
  const metrics = React.useMemo(() => {
    // Explicitly ensure it's an array
    const safeUsers = Array.isArray(users) ? users : [];
    // const safeUsers = users || [];
    
    console.log('SAFE')
    console.log(safeUsers)
  
  const total = safeUsers.length;
  const active = safeUsers.filter(u => u.isActive).length;
  const inactive = safeUsers.filter(u => !u.isActive).length;
  const admins = safeUsers.filter(u => u.role === "ADMIN").length
  const pharmacists = safeUsers.filter(u => u.role === "PHARMACIST").length;

  const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

  return { total, active, inactive, admins, pharmacists, activePercentage };
}, [users]);

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleStatus = async (user: UserListResponse["users"][number]) => {
    const res = await toggleUserStatus(user.id)
    if (res.success) {
      toast.success(res.message || "User status updated")
      fetchUsers()
    } else {
      toast.error(res.error || "Failed to update user status")
    }
  }

  return (
    <div className="w-full space-y-6 p-6 lg:p-8 bg-slate-50/30 min-h-screen font-sans">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 font-normal">
            Manage all user accounts and permissions.
          </p>
        </div>

        <Button
          onClick={() => setIsAddUserOpen(true)}
          className="h-9 gap-1.5 px-4 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs rounded-lg transition-colors duration-200"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" /> Add New User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
        <MetricCard title="Total Users" value={metrics.total.toString()} subtext="All accounts" icon={User2} />
        <MetricCard title="Active" value={metrics.active.toString()} subtext={`${metrics.activePercentage}% of total`} icon={ShieldCheck} />
        <MetricCard title="Inactive" value={metrics.inactive.toString()} subtext="Disabled accounts" icon={XCircle} />
        <MetricCard title="Admins" value={metrics.admins.toString()} subtext="Admin roles" icon={UserCog} />
        <MetricCard title="Pharmacists" value={metrics.pharmacists.toString()} subtext="Pharmacy staff" icon={Users} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-4">
        <TableMain
          columns={userColumns}
          data={users}
          loading={isLoading}
          searchKey=""
          tableFilterButtonVisible={false}
          columnVisibilityFilter={false}
          placeholder="User list..."
          meta={{
              onEdit(user) {
                 setIsEditUserOpen(true)
                 setSelectedUser(user)
             },
             onDelete(user) {
               toast.info("Delete feature coming soon")
             },
             onToggleStatus(user) {
               handleToggleStatus(user)
             }
          } as UserTableMeta}
        />
      </div>

      <AppSheet
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add New User"
        description="Create a new user account and assign initial permissions."
        maxWidth="lg"
      >
        <AddUserForm onSuccess={() => {
            fetchUsers()
            setIsAddUserOpen(false)
        }} />
      </AppSheet>

      <AppSheet
        isOpen={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        title="Edit User"
        description="Update user account details and permissions."
        maxWidth="lg"
      >
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onSuccess={() => {
              fetchUsers()
              setIsEditUserOpen(false)
            }}
          />
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

function MetricCard({ title, value, subtext, icon:Icon }: MetricCardType) {
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
