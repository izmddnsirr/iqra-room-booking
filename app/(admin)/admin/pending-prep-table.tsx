"use client"

import { useTransition } from "react"
import { KeyRoundIcon } from "lucide-react"

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
import { markReadyForCollection } from "@/lib/bookings/actions"
import { formatBookingPeriod } from "@/lib/bookings/format"
import { KEY_STATUS_COLORS } from "@/lib/bookings/types"
import type { AdminBooking } from "./bookings/all-bookings-table"

export function PendingPrepTable({ bookings }: { bookings: AdminBooking[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">Pending to Prepare</h2>
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
              <TableHead className="w-40" />
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
                  <Badge variant="outline" className={KEY_STATUS_COLORS.approved}>
                    In Preparation
                  </Badge>
                </TableCell>
                <TableCell>
                  <RowActions bookingId={booking.id} />
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No bookings pending preparation.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function RowActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markReadyForCollection(bookingId)
        })
      }
    >
      <KeyRoundIcon className="size-4" />
      Mark Key Prepared
    </Button>
  )
}
