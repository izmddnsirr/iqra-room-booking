"use client"

import { useTransition } from "react"
import { CheckIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { approveBooking, rejectBooking } from "@/lib/bookings/actions"
import { formatBookingPeriod } from "@/lib/bookings/format"

export type PendingBooking = {
  id: string
  applicant: string
  room: string
  floor: string
  startDate: string
  endDate: string
  totalAmount: number
}

export function PendingApprovalsTable({ bookings }: { bookings: PendingBooking[] }) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="w-32" />
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
                <RowActions bookingId={booking.id} />
              </TableCell>
            </TableRow>
          ))}
          {bookings.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No pending bookings.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function RowActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        className="size-8"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await approveBooking(bookingId)
          })
        }
      >
        <CheckIcon />
        <span className="sr-only">Approve</span>
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="size-8 text-destructive hover:text-destructive"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await rejectBooking(bookingId)
          })
        }
      >
        <XIcon />
        <span className="sr-only">Reject</span>
      </Button>
    </div>
  )
}
