"use client"

import * as React from "react"
import { useTransition } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { KeyRoundIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { markCollected, markKeyPrepared, markReadyForCollection } from "@/lib/bookings/actions"
import { KEY_STATUS_COLORS } from "@/lib/bookings/types"
import { ApplicantCell } from "./applicant-cell"
import type { QueueBooking } from "./booking-queue-mapper"

const statusBadge: Record<string, { label: string; className: string }> = {
  approved: { label: "In Preparation", className: KEY_STATUS_COLORS.approved },
  key_prepared: { label: "Key Prepared", className: KEY_STATUS_COLORS.key_prepared },
  ready_for_collection: { label: "Ready for Pickup", className: KEY_STATUS_COLORS.ready_for_collection },
}

const actionByStatus: Record<string, { label: string; onAction: (bookingId: string) => Promise<unknown> }> = {
  approved: { label: "Mark Key Prepared", onAction: markKeyPrepared },
  key_prepared: { label: "Mark Ready for Pickup", onAction: markReadyForCollection },
  ready_for_collection: { label: "Hand Over Key", onAction: markCollected },
}

function RowAction({ bookingId, status }: { bookingId: string; status: string }) {
  const [isPending, startTransition] = useTransition()

  const action = actionByStatus[status]
  if (!action) return null

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
      <KeyRoundIcon className="size-4" />
      {action.label}
    </Button>
  )
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
    size: 200,
    meta: { className: "text-right" },
    cell: ({ row }) => <RowAction bookingId={row.original.id} status={row.original.status} />,
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
            <SelectItem value="key_prepared">Key Prepared</SelectItem>
            <SelectItem value="ready_for_collection">Ready for Pickup</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredData} filterColumn="applicant" externalFilter={search} paginationLabel="bookings" />
    </div>
  )
}
