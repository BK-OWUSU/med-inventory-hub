"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TopSideBarLogo } from "@/components/sidebar-top-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/authStore"
import { getNavigationForRole } from "@/lib/constants/RoleAccessDef"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {user} = useAuthStore();
    const userData = {
      user: {
        name:  user?.fullName || "PharmSync User",
        email: user?.email || "pharmsyn@email.com",
        avatar: "/avatars/shadcn.jpg",
      },
   }

  const navigation = getNavigationForRole(user?.role ?? "VIEWER");
  return (
    <Sidebar  className="z-50" collapsible="icon" {...props}>
      <SidebarHeader className="bg-green-900 text-white">
        <TopSideBarLogo />
      </SidebarHeader>
      <SidebarContent className="bg-green-900 text-white">
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter className="bg-green-900 text-white">
        <NavUser user={userData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
