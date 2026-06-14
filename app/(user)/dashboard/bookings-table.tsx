"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { SearchIcon } from "lucide-react"

import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KEY_STATUS_LABELS, type BookingStatus } from "@/lib/bookings/types"

// From the user's perspective, "Key Prepared" is an internal receptionist
// step - both `approved` and `key_prepared` show as "In Preparation".
const USER_STATUS_LABELS: Record<BookingStatus, string> = {
  ...KEY_STATUS_LABELS,
  key_prepared: "In Preparation",
}
import { formatBookingPeriod } from "@/lib/bookings/format"
import { BookRoomDialog, type ActiveBooking, type Room } from "./book-room-dialog"

export type DashboardBooking = {
  id: string
  room: string
  floor: string
  startDate: string
  endDate: string
  status: BookingStatus
}

const statusClassName: Record<BookingStatus, string> = {
  pending: "text-muted-foreground",
  approved: "text-amber-600",
  key_prepared: "text-amber-600",
  ready_for_collection: "text-blue-600",
  in_process: "text-violet-600",
  completed: "text-green-600",
  cancelled: "text-muted-foreground",
  missing: "text-red-600",
}

const columns: ColumnDef<DashboardBooking>[] = [
  {
    accessorKey: "room",
    header: "Room",
    size: 160,
    cell: ({ row }) => <span className="font-medium">{row.getValue("room")}</span>,
  },
  {
    accessorKey: "floor",
    header: "Floor",
    size: 160,
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("floor")}</span>,
  },
  {
    id: "period",
    header: "Period",
    size: 240,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatBookingPeriod(row.original.startDate, row.original.endDate)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 320,
    cell: ({ row }) => {
      const status = row.getValue("status") as BookingStatus
      return (
        <div className={`font-medium ${statusClassName[status]}`}>
          {USER_STATUS_LABELS[status]}
        </div>
      )
    },
  },
]

export function BookingsTable({
  data,
  rooms,
  activeRoomBookings,
}: {
  data: DashboardBooking[]
  rooms: Room[]
  activeRoomBookings: ActiveBooking[]
}) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<string>("all")

  const filteredData = React.useMemo(() => {
    if (status === "all") return data
    if (status === "approved") return data.filter((booking) => booking.status === "approved" || booking.status === "key_prepared")
    return data.filter((booking) => booking.status === status)
  }, [data, status])

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Bookings</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 pl-8"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">In Preparation</SelectItem>
              <SelectItem value="ready_for_collection">Ready for Pickup</SelectItem>
              <SelectItem value="in_process">Collected</SelectItem>
            </SelectContent>
          </Select>
          <BookRoomDialog rooms={rooms} activeBookings={activeRoomBookings} />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        filterColumn="room"
        externalFilter={search}
      />
    </div>
  )
}
