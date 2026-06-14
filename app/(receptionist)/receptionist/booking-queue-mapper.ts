import type { BookingStatus } from "@/lib/bookings/types";

export const BOOKING_QUEUE_SELECT =
  "id, start_date, end_date, status, created_at, penalty_amount, penalty_charged_at, profiles(full_name), rooms(room_number, floor)";

export type QueueBooking = {
  id: string;
  applicant: string;
  room: string;
  floor: string;
  startDate: string;
  endDate: string;
  closedDate: string;
  status: BookingStatus;
  penaltyAmount: number | null;
  penaltyChargedAt: string | null;
};

type RawBooking = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  penalty_amount: number | null;
  penalty_charged_at: string | null;
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
      closedDate: booking.created_at,
      status: booking.status as BookingStatus,
      penaltyAmount: booking.penalty_amount,
      penaltyChargedAt: booking.penalty_charged_at,
    };
  });
}
