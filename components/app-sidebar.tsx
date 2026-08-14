"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogIn, ShieldCheck, Table2, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "User Management", href: "/user-management", icon: Users },
  { title: "Dynamic Table", href: "/dynamic-table", icon: Table2 },
]

const authNav = [
  { title: "Login (OTP)", href: "/", icon: LogIn },
  { title: "Login (2-step)", href: "/login2", icon: LogIn },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Acme Console</span>
            <span className="text-xs text-muted-foreground">Admin portal</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarMenu>
            {mainNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  render={<Link href={item.href} />}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Auth screens</SidebarGroupLabel>
          <SidebarMenu>
            {authNav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  render={<Link href={item.href} />}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="px-2 py-1 text-xs text-muted-foreground">v0 demo &middot; mock data</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
