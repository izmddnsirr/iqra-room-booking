import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/bookings/types"
import { formatBookingPeriod } from "@/lib/bookings/format"
import type { AdminBooking } from "./bookings/all-bookings-table"

const statusVariant: Record<BookingStatus, "default" | "outline" | "destructive" | "secondary"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  ready_for_collection: "default",
  in_process: "secondary",
  completed: "secondary",
  cancelled: "destructive",
}

export function RecentBookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent Bookings</h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/bookings">View all</Link>
        </Button>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.applicant}</TableCell>
                <TableCell>{booking.room}</TableCell>
                <TableCell>{booking.floor}</TableCell>
                <TableCell>{formatBookingPeriod(booking.startDate, booking.endDate)}</TableCell>
                <TableCell>RM {booking.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[booking.status]}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
