"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

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
import { LayoutDashboardIcon, CalendarCheckIcon, DoorOpenIcon, UsersIcon, CalendarPlusIcon, ListChecksIcon, InfoIcon, LayoutGridIcon, HourglassIcon, KeyRoundIcon, HistoryIcon, ClockIcon, SettingsIcon } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      badge: 12,
    },
    {
      title: "Pending Approvals",
      url: "/admin/pending-approvals",
      icon: <ClockIcon />,
      badge: 4,
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
      badge: 3,
    },
    {
      title: "Ready for Collection",
      url: "/receptionist/ready-collection",
      icon: <KeyRoundIcon />,
      badge: 2,
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

function getRoleLabel(pathname: string) {
  if (pathname.startsWith("/admin")) return "Admin"
  if (pathname.startsWith("/receptionist")) return "Receptionist"
  return "User"
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const isReceptionist = pathname.startsWith("/receptionist")

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={data.team} plan={getRoleLabel(pathname)} />
      </SidebarHeader>
      <SidebarContent>
        {isAdmin ? (
          <>
            <NavMain label="Main" items={data.adminNavMain} />
            <NavMain label="Bookings" items={data.adminNavBookings} />
            <NavMain label="Management" items={data.adminNavManagement} />
            <NavMain label="System" items={data.adminNavSystem} />
          </>
        ) : isReceptionist ? (
          <>
            <NavMain label="Main" items={data.receptionistNavMain} />
            <NavMain label="Bookings" items={data.receptionistNavBookings} />
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
