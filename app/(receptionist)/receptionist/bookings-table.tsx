"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBookingPeriod } from "@/lib/bookings/format"
import { markCollected, markReadyForCollection } from "@/lib/bookings/actions"
import { KEY_STATUS_COLORS } from "@/lib/bookings/types"
import { ApplicantCell } from "./applicant-cell"
import { BookingActionSelect, type BookingAction } from "./booking-action-select"
import type { QueueBooking } from "./booking-queue-mapper"

const statusBadge: Record<string, { label: string; className: string }> = {
  approved: { label: "In Preparation", className: KEY_STATUS_COLORS.approved },
  ready_for_collection: { label: "Ready for Pickup", className: KEY_STATUS_COLORS.ready_for_collection },
}

const actionsByStatus: Record<string, BookingAction[]> = {
  approved: [{ value: "ready", label: "Mark Ready", onAction: markReadyForCollection }],
  ready_for_collection: [{ value: "collect", label: "Hand Over Key", onAction: markCollected }],
}

const columns: ColumnDef<QueueBooking>[] = [
  {
    accessorKey: "applicant",
    header: "Applicant",
    size: 280,
    cell: ({ row }) => <ApplicantCell name={row.getValue("applicant")} />,
  },
  {
    accessorKey: "room",
    header: "Room",
    size: 90,
  },
  {
    accessorKey: "floor",
    header: "Floor",
    size: 90,
  },
  {
    id: "period",
    header: "Period",
    size: 200,
    cell: ({ row }) => formatBookingPeriod(row.original.startDate, row.original.endDate),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 140,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const badge = statusBadge[status]
      if (!badge) return null
      return <Badge variant="outline" className={badge.className}>{badge.label}</Badge>
    },
  },
  {
    id: "action",
    header: "Action",
    size: 180,
    cell: ({ row }) => {
      const actions = actionsByStatus[row.original.status]
      if (!actions) return null
      return <BookingActionSelect bookingId={row.original.id} actions={actions} />
    },
  },
]

export function BookingsTable({ data }: { data: QueueBooking[] }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<string>("all")

  const filteredData = React.useMemo(() => {
    if (status === "all") return data
    return data.filter((booking) => booking.status === status)
  }, [data, status])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
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
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="approved">In Preparation</SelectItem>
            <SelectItem value="ready_for_collection">Ready for Pickup</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredData} filterColumn="applicant" externalFilter={search} paginationLabel="bookings" />
    </div>
  )
}
