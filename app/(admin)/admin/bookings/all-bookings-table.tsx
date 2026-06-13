"use client"

import { useState } from "react"
import { SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

export type AdminBooking = {
  id: string
  applicant: string
  room: string
  floor: string
  startDate: string
  endDate: string
  totalAmount: number
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

export function AllBookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  const [search, setSearch] = useState("")

  const filtered = bookings.filter((booking) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    return (
      booking.applicant.toLowerCase().includes(query) ||
      booking.room.toLowerCase().includes(query) ||
      booking.floor.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by applicant or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
            {filtered.map((booking) => (
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
