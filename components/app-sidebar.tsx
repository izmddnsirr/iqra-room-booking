"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { Role } from "@/lib/auth"
import { LayoutDashboardIcon, CalendarCheckIcon, DoorOpenIcon, UsersIcon, CalendarPlusIcon, ListChecksIcon, InfoIcon, LayoutGridIcon, HourglassIcon, KeyRoundIcon, HistoryIcon, ClockIcon, SettingsIcon } from "lucide-react"

// This is sample data.
const data = {
  team: {
    name: "Iqra Room",
    logo: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/ptta.png" alt="PTTA logo" className="size-full object-contain" />
    ),
  },
  adminNavMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
  ],
  adminNavBookings: [
    {
      title: "All Bookings",
      url: "/admin/bookings",
      icon: <CalendarCheckIcon />,
    },
    {
      title: "Pending Approvals",
      url: "/admin/pending-approvals",
      icon: <ClockIcon />,
    },
  ],
  adminNavManagement: [
    {
      title: "Manage Rooms",
      url: "/admin/rooms",
      icon: <DoorOpenIcon />,
    },
    {
      title: "Manage Users",
      url: "/admin/users",
      icon: <UsersIcon />,
    },
  ],
  adminNavSystem: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: <SettingsIcon />,
    },
  ],
  userNavMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "New Booking",
      url: "/booking",
      icon: <CalendarPlusIcon />,
    },
    {
      title: "Booking Status",
      url: "/booking/status",
      icon: <ListChecksIcon />,
    },
  ],
  userNavInfo: [
    {
      title: "Room Rules",
      url: "/room-rules",
      icon: <InfoIcon />,
    },
  ],
  receptionistNavMain: [
    {
      title: "Dashboard",
      url: "/receptionist",
      icon: <LayoutGridIcon />,
    },
  ],
  receptionistNavBookings: [
    {
      title: "In Process",
      url: "/receptionist/in-process",
      icon: <HourglassIcon />,
    },
    {
      title: "Ready for Collection",
      url: "/receptionist/ready-collection",
      icon: <KeyRoundIcon />,
    },
  ],
  receptionistNavOther: [
    {
      title: "Key History",
      url: "/receptionist/key-history",
      icon: <HistoryIcon />,
    },
  ],
}

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  receptionist: "Receptionist",
  user: "User",
}

export function AppSidebar({
  user,
  notificationCount,
  allBookingsCount,
  pendingApprovalsCount,
  inProcessCount,
  readyForCollectionCount,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; role: Role }
  notificationCount?: number
  allBookingsCount?: number
  pendingApprovalsCount?: number
  inProcessCount?: number
  readyForCollectionCount?: number
}) {
  const adminNavBookings = data.adminNavBookings.map((item) => ({
    ...item,
    badge:
      item.url === "/admin/bookings"
        ? allBookingsCount || undefined
        : item.url === "/admin/pending-approvals"
          ? pendingApprovalsCount || undefined
          : undefined,
  }))

  const receptionistNavBookings = data.receptionistNavBookings.map((item) => ({
    ...item,
    badge:
      item.url === "/receptionist/in-process"
        ? inProcessCount || undefined
        : item.url === "/receptionist/ready-collection"
          ? readyForCollectionCount || undefined
          : undefined,
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={data.team} plan={ROLE_LABELS[user.role]} />
      </SidebarHeader>
      <SidebarContent>
        {user.role === "admin" ? (
          <>
            <NavMain label="Main" items={data.adminNavMain} />
            <NavMain label="Bookings" items={adminNavBookings} />
            <NavMain label="Management" items={data.adminNavManagement} />
            <NavMain label="System" items={data.adminNavSystem} />
          </>
        ) : user.role === "receptionist" ? (
          <>
            <NavMain label="Main" items={data.receptionistNavMain} />
            <NavMain label="Bookings" items={receptionistNavBookings} />
            <NavMain label="Other" items={data.receptionistNavOther} />
          </>
        ) : (
          <>
            <NavMain label="Menu" items={data.userNavMain} />
            <NavMain label="Information" items={data.userNavInfo} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email, avatar: "" }} notificationCount={notificationCount} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
