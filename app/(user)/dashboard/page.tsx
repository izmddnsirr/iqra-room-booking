import type { Metadata } from "next";

import { DoorOpenIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingStatus } from "@/lib/bookings/types";
import { formatBookingPeriod } from "@/lib/bookings/format";
import { BookingsTable, type DashboardBooking } from "./bookings-table";
import { HistoryTable, type HistoryBooking } from "./history-table";

export const metadata: Metadata = {
  title: "Dashboard",
};

const ACTIVE_STATUSES: BookingStatus[] = ["approved", "key_prepared", "ready_for_collection", "in_process"];
const HISTORY_STATUSES: BookingStatus[] = ["completed", "cancelled"];

export default async function UserDashboardPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const [{ data: bookings }, { data: rooms }, { data: activeRoomBookings }] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, start_date, end_date, status, created_at, rooms(room_number, floor)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("rooms")
      .select("id, room_number, floor, status, notes")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    adminClient
      .from("bookings")
      .select("room_id, start_date, end_date")
      .in("status", ACTIVE_STATUSES),
  ]);

  const allBookings = bookings ?? [];

  const activeBookings: DashboardBooking[] = allBookings
    .filter((booking) => ACTIVE_STATUSES.includes(booking.status as BookingStatus))
    .map((booking) => {
      const room = booking.rooms as unknown as { room_number: string; floor: string } | null;
      return {
        id: booking.id,
        room: room?.room_number ?? "—",
        floor: room?.floor ?? "—",
        startDate: booking.start_date,
        endDate: booking.end_date,
        status: booking.status as BookingStatus,
      };
    });

  const historyBookings: HistoryBooking[] = allBookings
    .filter((booking) => HISTORY_STATUSES.includes(booking.status as BookingStatus))
    .map((booking) => {
      const room = booking.rooms as unknown as { room_number: string; floor: string } | null;
      return {
        id: booking.id,
        room: room?.room_number ?? "—",
        floor: room?.floor ?? "—",
        startDate: booking.start_date,
        endDate: booking.end_date,
        closedDate: booking.created_at,
        status: booking.status as BookingStatus,
      };
    });

  const currentBooking = allBookings.find((b) => b.status === "in_process");
  const currentRoom = currentBooking?.rooms as unknown as { room_number: string; floor: string } | null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name ?? "User"} 👋</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s an overview of your bookings.</p>
      </div>

      {/* Active Room Banner */}
      {currentBooking && currentRoom && (
        <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 px-6 py-5 dark:border-primary/30 dark:bg-primary/10">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
            <DoorOpenIcon className="size-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium uppercase text-primary">Your Active Room</p>
            <p className="text-lg font-semibold">
              {currentRoom.room_number} · {currentRoom.floor}{" "}
              <span className="font-normal text-muted-foreground">
                {formatBookingPeriod(currentBooking.start_date, currentBooking.end_date)}
              </span>
            </p>
          </div>
          <span className="rounded-full border border-primary/30 px-4 py-1.5 text-sm font-medium text-primary dark:border-primary/40">
            Collected
          </span>
        </div>
      )}

      {/* Bookings */}
      <BookingsTable data={activeBookings} rooms={rooms ?? []} activeRoomBookings={activeRoomBookings ?? []} />

      {/* History */}
      <HistoryTable data={historyBookings} />
    </div>
  );
}
