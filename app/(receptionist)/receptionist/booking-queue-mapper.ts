import type { BookingStatus } from "@/lib/bookings/types";

export const BOOKING_QUEUE_SELECT =
  "id, start_date, end_date, status, created_at, rental_months, monthly_rate, total_amount, penalty_amount, penalty_charged_at, profiles(full_name, email, matric_staff_id, phone_number), rooms(room_number, floor)";

export type QueueBooking = {
  id: string;
  applicant: string;
  applicantEmail: string;
  applicantMatricStaffId: string;
  applicantPhone: string;
  room: string;
  floor: string;
  startDate: string;
  endDate: string;
  closedDate: string;
  status: BookingStatus;
  rentalMonths: number;
  monthlyRate: number;
  totalAmount: number;
  penaltyAmount: number | null;
  penaltyChargedAt: string | null;
};

type RawBooking = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  rental_months: number;
  monthly_rate: number;
  total_amount: number;
  penalty_amount: number | null;
  penalty_charged_at: string | null;
  profiles: unknown;
  rooms: unknown;
};

export function mapQueueBookings(bookings: RawBooking[] | null): QueueBooking[] {
  return (bookings ?? []).map((booking) => {
    const profile = booking.profiles as { full_name: string; email: string; matric_staff_id: string | null; phone_number: string | null } | null;
    const room = booking.rooms as { room_number: string; floor: string } | null;
    return {
      id: booking.id,
      applicant: profile?.full_name ?? "—",
      applicantEmail: profile?.email ?? "—",
      applicantMatricStaffId: profile?.matric_staff_id ?? "—",
      applicantPhone: profile?.phone_number ?? "—",
      room: room?.room_number ?? "—",
      floor: room?.floor ?? "—",
      startDate: booking.start_date,
      endDate: booking.end_date,
      closedDate: booking.created_at,
      status: booking.status as BookingStatus,
      rentalMonths: booking.rental_months,
      monthlyRate: booking.monthly_rate,
      totalAmount: booking.total_amount,
      penaltyAmount: booking.penalty_amount,
      penaltyChargedAt: booking.penalty_charged_at,
    };
  });
}
