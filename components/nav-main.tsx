"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { NavGroup, NavItem } from "@/types/types/app.type"

type ParsedSubItem = NavItem & { url: string }
type ParsedNavGroup = Omit<NavGroup, "items"> & {
  url: string
  items?: ParsedSubItem[]
}

export function NavMain({ items }: { items: ParsedNavGroup[] }) {
  const pathname = usePathname()
  const [openGroup, setOpenGroup] = React.useState<string | null>(() => {
    const activeGroup = items.find((group) =>
      group.items?.some((subItem) => pathname === subItem.url)
    )
    return activeGroup ? activeGroup.accessKey : null
  })

  const [lastPathname, setLastPathname] = React.useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    const activeGroup = items.find((group) =>
      group.items?.some((subItem) => pathname === subItem.url)
    )
    setOpenGroup(activeGroup ? activeGroup.accessKey : null)
  }

  const renderMenuItem = (group: ParsedNavGroup) => {
    const hasSubItems = group.items && group.items.length > 0
    const isSubActive = group.items?.some((subItem) => pathname === subItem.url) ?? false
    
    const isParentActive = hasSubItems 
      ? isSubActive 
      : (pathname === group.url || (group.routeBase === "dashboard" && pathname === "/"))

    const isOpen = openGroup === group.accessKey

    if (hasSubItems) {
      return (
        <Collapsible
          key={group.accessKey}
          open={isOpen}
          onOpenChange={(open) => setOpenGroup(open ? group.accessKey : null)}
          className="group/collapsible w-full"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton 
                tooltip={group.title}
                isActive={isParentActive}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isParentActive 
                    ? "font-semibold text-white bg-green-800/40 animate-pulse" 
                    : "text-green-100/80 hover:text-white hover:bg-green-800/30"
                }`}
              >
                {group.icon && <group.icon className="h-4 w-4 shrink-0" />}
                <span className="truncate text-[14px]">{group.title}</span>
                <ChevronRightIcon 
                  className="ml-auto h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" 
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent className="w-full">
              <SidebarMenuSub className="mx-0 pl-7 pr-0 py-1 border-l border-green-800/40 space-y-1">
                {group.items?.map((subItem) => {
                  const isCurrentSubActive = pathname === subItem.url

                  return (
                    <SidebarMenuSubItem key={subItem.accessKey}>
                      <SidebarMenuSubButton 
                        asChild
                        isActive={isCurrentSubActive}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all duration-200 ${
                          isCurrentSubActive 
                            ? "font-semibold bg-white text-green-900 shadow-sm hover:bg-white hover:text-green-900" 
                            : "text-green-200/70 hover:text-white hover:bg-green-800/20"
                        }`}
                      >
                        <Link href={subItem.url}>
                          {subItem.icon && <subItem.icon className="h-3.5 w-3.5 shrink-0" />}
                          <span className="truncate">{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    return (
      <SidebarMenuItem key={group.accessKey}>
        <SidebarMenuButton
          asChild
          tooltip={group.title}
          isActive={isParentActive}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isParentActive
              ? "font-semibold bg-white text-green-900 shadow-sm hover:bg-white hover:text-green-900" 
              : "text-green-100/80 hover:text-white hover:bg-green-800/40"
          }`}
        >
          <Link href={group.url}>
            {group.icon && <group.icon className="h-4 w-4 shrink-0" />}
            <span className="text-[14px] font-normal tracking-wide">{group.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarGroup className="py-2 px-2 w-full">
      <SidebarMenu className="space-y-1.5 w-full">
        {items.map((group) => renderMenuItem(group))}
      </SidebarMenu>
    </SidebarGroup>
  )
}