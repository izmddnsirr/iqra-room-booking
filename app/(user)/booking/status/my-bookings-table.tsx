"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDownIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { cancelBooking } from "@/lib/bookings/actions"
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/bookings/types"
import { formatBookingPeriod } from "@/lib/bookings/format"

export type MyBooking = {
  id: string
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

const columns: ColumnDef<MyBooking>[] = [
  {
    accessorKey: "room",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Room
        <ArrowUpDownIcon className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.getValue("room")}</span>
        <span className="text-xs text-muted-foreground">{row.original.floor}</span>
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Period
        <ArrowUpDownIcon className="ml-2 size-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span>{formatBookingPeriod(row.original.startDate, row.original.endDate)}</span>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => <span>RM {row.original.totalAmount.toFixed(2)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as BookingStatus
      return <Badge variant={statusVariant[status]}>{BOOKING_STATUS_LABELS[status]}</Badge>
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const booking = row.original
      if (booking.status !== "pending") return null
      return <CancelButton bookingId={booking.id} />
    },
  },
]

function CancelButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = React.useTransition()

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await cancelBooking(bookingId)
        })
      }
    >
      Cancel
    </Button>
  )
}

export function MyBookingsTable({ data }: { data: MyBooking[] }) {
  const [filter, setFilter] = React.useState("")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">My Bookings</h2>
        <Input
          placeholder="Filter by room..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-56"
        />
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn="room"
        externalFilter={filter}
      />
    </div>
  )
}
