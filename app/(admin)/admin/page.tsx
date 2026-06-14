import type { Metadata } from "next";

import { AlertTriangleIcon, CalendarCheckIcon, DoorOpenIcon, KeyRoundIcon, UsersIcon } from "lucide-react";

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
import { OverdueMissingTable } from "./overdue-missing-table";
import type { AdminBooking } from "./bookings/all-bookings-table";
import { BOOKING_QUEUE_SELECT, mapQueueBookings } from "../../(receptionist)/receptionist/booking-queue-mapper";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: bookingsCount },
    { count: roomsCount },
    { count: usersCount },
    { count: readyCount },
    { data: recentBookings },
    { data: pendingPrepBookings },
    { data: inProcessBookings },
    { data: missingBookings },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("rooms").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "ready_for_collection"),
    supabase
      .from("bookings")
      .select("id, start_date, end_date, total_amount, status, profiles(full_name), rooms(room_number, floor)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("id, start_date, end_date, total_amount, status, profiles(full_name), rooms(room_number, floor)")
      .in("status", ["approved", "key_prepared"])
      .order("start_date", { ascending: true }),
    supabase
      .from("bookings")
      .select(BOOKING_QUEUE_SELECT)
      .eq("status", "in_process")
      .order("end_date", { ascending: true }),
    supabase
      .from("bookings")
      .select(BOOKING_QUEUE_SELECT)
      .eq("status", "missing")
      .order("end_date", { ascending: true }),
  ]);

  const pendingPrepCount = (pendingPrepBookings ?? []).length;

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

  const today = new Date().toISOString().slice(0, 10);
  const inProcess = mapQueueBookings(inProcessBookings).map((booking) => ({
    ...booking,
    isOverdue: booking.endDate < today,
  }));
  const overdue = inProcess.filter((booking) => booking.isOverdue);
  const missing = mapQueueBookings(missingBookings).map((booking) => ({ ...booking, isOverdue: false }));
  const overdueMissingData = [...overdue, ...missing];

  const stats = [
    {
      label: "Key Pending to Prepare",
      value: pendingPrepCount,
      icon: <KeyRoundIcon className="size-5 text-amber-600" />,
      labelClassName: "text-amber-600",
    },
    {
      label: "Keys Ready",
      value: readyCount ?? 0,
      icon: <KeyRoundIcon className="size-5 text-blue-600" />,
      labelClassName: "text-blue-600",
    },
    {
      label: "Overdue & Missing",
      value: overdueMissingData.length,
      icon: <AlertTriangleIcon className="size-5 text-orange-600" />,
      labelClassName: "text-orange-600",
    },
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
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of bookings, rooms, and users.</p>
        </div>
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
        <OverdueMissingTable bookings={overdueMissingData} />
        <RecentBookingsTable bookings={recentBookingsData} />
      </div>
    </SidebarInset>
  );
}
