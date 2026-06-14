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
import { KEY_STATUS_COLORS, KEY_STATUS_LABELS, type BookingStatus } from "@/lib/bookings/types"
import { formatBookingPeriod } from "@/lib/bookings/format"
import type { AdminBooking } from "./bookings/all-bookings-table"

const statusBadgeClassName: Record<BookingStatus, string | undefined> = {
  pending: undefined,
  approved: KEY_STATUS_COLORS.approved,
  key_prepared: KEY_STATUS_COLORS.key_prepared,
  ready_for_collection: KEY_STATUS_COLORS.ready_for_collection,
  in_process: KEY_STATUS_COLORS.in_process,
  completed: KEY_STATUS_COLORS.completed,
  cancelled: KEY_STATUS_COLORS.cancelled,
  missing: KEY_STATUS_COLORS.missing,
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
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-64">Applicant</TableHead>
              <TableHead className="w-24">Room</TableHead>
              <TableHead className="w-24">Floor</TableHead>
              <TableHead className="w-48">Period</TableHead>
              <TableHead className="w-28">Amount</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-56" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="truncate">{booking.applicant}</TableCell>
                <TableCell>{booking.room}</TableCell>
                <TableCell>{booking.floor}</TableCell>
                <TableCell>{formatBookingPeriod(booking.startDate, booking.endDate)}</TableCell>
                <TableCell>RM {booking.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeClassName[booking.status]}>
                    {KEY_STATUS_LABELS[booking.status]}
                  </Badge>
                </TableCell>
                <TableCell />
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
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
