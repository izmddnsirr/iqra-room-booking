"use client"

import { useTransition } from "react"
import { AlertTriangleIcon } from "lucide-react"

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
import { chargePenalty } from "@/lib/bookings/actions"
import { formatBookingPeriod } from "@/lib/bookings/format"
import { KEY_STATUS_COLORS } from "@/lib/bookings/types"
import type { QueueBooking } from "../../(receptionist)/receptionist/booking-queue-mapper"

const ACCESS_CARD_PENALTY = 50

export function OverdueMissingTable({ bookings }: { bookings: (QueueBooking & { isOverdue: boolean })[] }) {
  return (
    <div className="flex flex-col gap-2">
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
              <TableHead className="w-56 text-right">Action</TableHead>
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
                  {booking.status === "missing" ? (
                    <Badge variant="outline" className={KEY_STATUS_COLORS.missing}>Missing</Badge>
                  ) : (
                    <Badge variant="outline" className={KEY_STATUS_COLORS.overdue}>Overdue</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <ChargePenaltyButton booking={booking} />
                </TableCell>
              </TableRow>
            ))}
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No overdue or missing bookings.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ChargePenaltyButton({ booking }: { booking: QueueBooking & { isOverdue: boolean } }) {
  const [isPending, startTransition] = useTransition()

  if (booking.status !== "missing") {
    return (
      <Button size="sm" variant="outline" disabled>
        <AlertTriangleIcon className="size-4" />
        Charge Penalty
      </Button>
    )
  }

  if (booking.penaltyChargedAt) {
    return (
      <Button size="sm" variant="outline" disabled>
        Penalty Charged
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await chargePenalty(booking.id)
        })
      }
    >
      <AlertTriangleIcon className="size-4" />
      Charge Penalty (RM{ACCESS_CARD_PENALTY})
    </Button>
  )
}
