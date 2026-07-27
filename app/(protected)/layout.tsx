"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/securityContext/AuthGuard"
import { useNotificationStore } from "@/store/notificationStore"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { NavbarUser } from "@/components/NavbarUser"
import { useAuthStore } from "@/store/authStore"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const {user} = useAuthStore()
  const { notifications } = useNotificationStore();
  const pathname = usePathname();
  const facilityName = user?.facility?.name || "PharmSync"



  // Generate a clean, scannable page title derived from the current URL path
  const currentPathSegment = pathname.split("/").pop() || "Dashboard";
  const formattedPageTitle = currentPathSegment.charAt(0).toUpperCase() + currentPathSegment.slice(1);

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex bg-transparent z-10 backdrop-blur-md sticky top-0 border-b p-2 h-16 shrink-0 items-center gap-2 transition-[width,height] justify-between ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <span className="text-slate-400 font-medium">{facilityName}</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize">{formattedPageTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            <div className="flex items-center gap-6 px-4">
              <NotificationBell notifications={notifications} />
              <NavbarUser />
            </div>
          </header>
          
          <main className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
