import type { Metadata } from "next";

import {
  CalendarPlusIcon,
  ListChecksIcon,
  ArrowRightIcon,
  CalendarIcon,
  CircleDollarSignIcon,
  BuildingIcon,
  KeyRoundIcon,
} from "lucide-react";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { RecentBookingsTable, type RecentBooking } from "./recent-bookings-table";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
};

const quickActions = [
  {
    label: "New Booking",
    description: "Check room availability and book by date",
    icon: <CalendarPlusIcon className="size-5" />,
    href: "/booking",
  },
  {
    label: "Check Status",
    description: "View your key status and booking details",
    icon: <ListChecksIcon className="size-5" />,
    href: "/booking/status",
  },
];

const recentBookings: RecentBooking[] = [
  { room: "Iqra 101", duration: "1 Aug – 1 Nov 2026 · 3 months", status: "In Process" },
  { room: "Iqra 203", duration: "1 Feb – 1 Apr 2026 · 2 months", status: "Ready for Collection" },
  { room: "Iqra 401", duration: "1 Sep – 1 Dec 2025 · 3 months", status: "Completed" },
];

const roomRules = [
  { icon: <CalendarIcon className="size-4 shrink-0 text-primary" />, text: "Rental period: minimum 1 month, maximum 3 months" },
  { icon: <CircleDollarSignIcon className="size-4 shrink-0 text-primary" />, text: "Payment: RM30 per month — credited to SMAP" },
  { icon: <BuildingIcon className="size-4 shrink-0 text-primary" />, text: "Rooms available on Level 2 and Level 4 only" },
  { icon: <KeyRoundIcon className="size-4 shrink-0 text-primary" />, text: "Key collected at counter after receptionist confirmation" },
];


export default function UserDashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">

          {/* Welcome */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">Welcome, Izamuddin 👋</h1>
              <p className="text-sm text-muted-foreground mt-1">You have 1 active booking</p>
            </div>
            <Badge variant="secondary" className="mt-1">UTHM User</Badge>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Card className="h-full cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="flex items-center gap-4 py-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                    </div>
                    <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent Bookings */}
          <RecentBookingsTable data={recentBookings} />

          {/* Room Rules */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Iqra Room Rules</h2>
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Rule</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomRules.map((rule, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {rule.icon}
                          {rule.text}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
