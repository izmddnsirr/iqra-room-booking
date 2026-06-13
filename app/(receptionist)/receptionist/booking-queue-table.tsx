"use client"

import { useTransition } from "react"

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

export type QueueBooking = {
  id: string
  applicant: string
  room: string
  floor: string
  startDate: string
  endDate: string
  status: BookingStatus
}

const statusVariant: Record<BookingStatus, "default" | "outline" | "destructive" | "secondary"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  ready_for_collection: "default",
  in_process: "secondary",
  completed: "secondary",
  cancelled: "destructive",
}

export function BookingQueueTable({
  bookings,
  action,
}: {
  bookings: QueueBooking[]
  action?: {
    label: string
    onAction: (bookingId: string) => Promise<unknown>
  }
}) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            {action && <TableHead className="w-32" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.applicant}</TableCell>
              <TableCell>{booking.room}</TableCell>
              <TableCell>{booking.floor}</TableCell>
              <TableCell>{formatBookingPeriod(booking.startDate, booking.endDate)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[booking.status]}>
                  {BOOKING_STATUS_LABELS[booking.status]}
                </Badge>
              </TableCell>
              {action && (
                <TableCell>
                  <ActionButton bookingId={booking.id} action={action} />
                </TableCell>
              )}
            </TableRow>
          ))}
          {bookings.length === 0 && (
            <TableRow>
              <TableCell colSpan={action ? 6 : 5} className="text-center text-muted-foreground">
                No bookings.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function ActionButton({
  bookingId,
  action,
}: {
  bookingId: string
  action: { label: string; onAction: (bookingId: string) => Promise<unknown> }
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await action.onAction(bookingId)
        })
      }
    >
      {action.label}
    </Button>
  )
}
