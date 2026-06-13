import type { Metadata } from "next";

import {
  CalendarPlusIcon,
  ListChecksIcon,
  ArrowRightIcon,
  KeyIcon,
  DoorOpenIcon,
} from "lucide-react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RecentBookingsTable, type RecentBooking } from "./recent-bookings-table";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/bookings/types";
import { formatBookingPeriod } from "@/lib/bookings/format";

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

export default async function UserDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_date, end_date, rental_months, status, rooms(room_number, floor)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const recentBookings: RecentBooking[] = (bookings ?? []).map((booking) => {
    const room = booking.rooms as unknown as { room_number: string; floor: string } | null;
    return {
      room: room?.room_number ?? "—",
      duration: `${formatBookingPeriod(booking.start_date, booking.end_date)} · ${booking.rental_months} month${booking.rental_months > 1 ? "s" : ""}`,
      status: booking.status as BookingStatus,
    };
  });

  const currentBooking = (bookings ?? []).find((b) => b.status === "in_process");
  const currentRoom = currentBooking?.rooms as unknown as { room_number: string; floor: string } | null;

  const { data: readyBookings } = await supabase
    .from("bookings")
    .select("rooms(room_number)")
    .eq("user_id", user!.id)
    .eq("status", "ready_for_collection");

  const readyRooms = (readyBookings ?? []).map((booking) => {
    const room = booking.rooms as unknown as { room_number: string } | null;
    return room?.room_number ?? "—";
  });

  return (
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

          {/* Welcome */}
          <div>
            <h1 className="text-xl font-bold">Welcome, {profile?.full_name ?? "User"}</h1>
          </div>

          {/* Ready for Collection Banner */}
          {readyRooms.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950">
              <KeyIcon className="size-5 shrink-0 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Your key{readyRooms.length > 1 ? "s are" : " is"} ready for collection!
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  {readyRooms.join(", ")} — collect at the counter.
                </p>
              </div>
            </div>
          )}

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

          {/* Your Room */}
          <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DoorOpenIcon className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Your room</p>
              <p className="text-xs text-muted-foreground">
                {currentBooking && currentRoom
                  ? `${currentRoom.room_number} (${currentRoom.floor}) · ${formatBookingPeriod(currentBooking.start_date, currentBooking.end_date)}`
                  : "No active room"}
              </p>
            </div>
          </div>

          {/* Recent Bookings */}
          <RecentBookingsTable data={recentBookings} />

        </div>
    </SidebarInset>
  );
}
