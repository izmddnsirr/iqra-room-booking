import type { BookingStatus } from "@/lib/bookings/types";
import type { QueueBooking } from "./booking-queue-table";

export const BOOKING_QUEUE_SELECT =
  "id, start_date, end_date, status, profiles(full_name), rooms(room_number, floor)";

type RawBooking = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  profiles: unknown;
  rooms: unknown;
};

export function mapQueueBookings(bookings: RawBooking[] | null): QueueBooking[] {
  return (bookings ?? []).map((booking) => {
    const profile = booking.profiles as { full_name: string } | null;
    const room = booking.rooms as { room_number: string; floor: string } | null;
    return {
      id: booking.id,
      applicant: profile?.full_name ?? "—",
      room: room?.room_number ?? "—",
      floor: room?.floor ?? "—",
      startDate: booking.start_date,
      endDate: booking.end_date,
      status: booking.status as BookingStatus,
    };
  });
}
