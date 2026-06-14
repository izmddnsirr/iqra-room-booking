import type { Metadata } from "next";

import { CalendarCheckIcon, DoorOpenIcon, UsersIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/bookings/types";
import { RecentBookingsTable } from "./recent-bookings-table";
import { PendingPrepTable } from "./pending-prep-table";
import type { AdminBooking } from "./bookings/all-bookings-table";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: bookingsCount }, { count: roomsCount }, { count: usersCount }, { data: recentBookings }, { data: pendingPrepBookings }] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("rooms").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("id, start_date, end_date, total_amount, status, profiles(full_name), rooms(room_number, floor)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("id, start_date, end_date, total_amount, status, profiles(full_name), rooms(room_number, floor)")
      .eq("status", "approved")
      .order("start_date", { ascending: true }),
  ]);

  const mapBooking = (booking: {
    id: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    status: string;
    profiles: unknown;
    rooms: unknown;
  }): AdminBooking => {
    const profile = booking.profiles as unknown as { full_name: string } | null;
    const room = booking.rooms as unknown as { room_number: string; floor: string } | null;
    return {
      id: booking.id,
      applicant: profile?.full_name ?? "—",
      room: room?.room_number ?? "—",
      floor: room?.floor ?? "—",
      startDate: booking.start_date,
      endDate: booking.end_date,
      totalAmount: Number(booking.total_amount),
      status: booking.status as BookingStatus,
    };
  };

  const recentBookingsData: AdminBooking[] = (recentBookings ?? []).map(mapBooking);
  const pendingPrepData: AdminBooking[] = (pendingPrepBookings ?? []).map(mapBooking);

  const stats = [
    {
      label: "Total Bookings",
      value: bookingsCount ?? 0,
      icon: <CalendarCheckIcon className="size-5 text-blue-600" />,
      labelClassName: "text-blue-600",
    },
    {
      label: "Total Rooms",
      value: roomsCount ?? 0,
      icon: <DoorOpenIcon className="size-5 text-amber-600" />,
      labelClassName: "text-amber-600",
    },
    {
      label: "Total Users",
      value: usersCount ?? 0,
      icon: <UsersIcon className="size-5 text-emerald-600" />,
      labelClassName: "text-emerald-600",
    },
  ];

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className={`text-sm font-medium ${stat.labelClassName}`}>
                  {stat.label}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-semibold">{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        <PendingPrepTable bookings={pendingPrepData} />
        <RecentBookingsTable bookings={recentBookingsData} />
      </div>
    </SidebarInset>
  );
}
