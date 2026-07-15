"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"

export function TopSideBarLogo({
}) {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
       <div className="flex items-center gap-3">
        <Image 
          src="/img/logo-plain.png" 
          alt="Med-Hub-Inventory-App-Logo"
          width={48}  // Sets baseline width layout attribute (e.g., 48px)
          height={48} // Sets baseline height layout attribute (e.g., 48px)
          className="w-12 h-12 object-contain" // Forces exact CSS dimensions via Tailwind
        />
        <p className="text-white text-xl font-bold tracking-wide">
          MedInHub
        </p>
      </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
