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
import { formatBookingDate, formatBookingPeriod } from "@/lib/bookings/format"

export type HistoryBooking = {
  id: string
  room: string
  floor: string
  startDate: string
  endDate: string
  closedDate: string
  status: BookingStatus
}

const statusClassName: Record<BookingStatus, string> = {
  pending: "text-muted-foreground",
  approved: "text-blue-600",
  key_prepared: "text-cyan-600",
  ready_for_collection: "text-blue-600",
  in_process: "text-violet-600",
  completed: "text-green-600",
  cancelled: "text-red-600",
  missing: "text-red-600",
}

const columns: ColumnDef<HistoryBooking>[] = [
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
    accessorKey: "closedDate",
    header: "Closed Date",
    size: 160,
    cell: ({ row }) => (
      <span className="text-muted-foreground uppercase">
        {formatBookingDate(row.original.closedDate)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 160,
    cell: ({ row }) => {
      const status = row.getValue("status") as BookingStatus
      return (
        <div className={`font-medium ${statusClassName[status]}`}>
          {KEY_STATUS_LABELS[status]}
        </div>
      )
    },
  },
]

export function HistoryTable({ data }: { data: HistoryBooking[] }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<string>("all")

  const filteredData = React.useMemo(() => {
    if (status === "all") return data
    return data.filter((booking) => booking.status === status)
  }, [data, status])

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">History</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search history..."
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
              <SelectItem value="completed">Returned</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
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
