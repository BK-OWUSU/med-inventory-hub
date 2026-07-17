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
import { parsedNavData } from "@/lib/constants/nav-Def"
import { useAuthStore } from "@/store/authStore"

// This is sample data.
const data = {
  user: {
    name: "PharmSync User",
    email: "pharmsyn@email.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {user} = useAuthStore();
  const userData = {
    user: {
    name: user ?  user?.fullName : data.user.name,
    email: user ? user?.email : data.user.email,
    avatar: "/img/system-user.png"
  }}
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-green-900 text-white">
        <TopSideBarLogo />
      </SidebarHeader>
      <SidebarContent className="bg-green-900 text-white">
        <NavMain items={parsedNavData} />
      </SidebarContent>
      <SidebarFooter className="bg-green-900 text-white">
        <NavUser user={userData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
