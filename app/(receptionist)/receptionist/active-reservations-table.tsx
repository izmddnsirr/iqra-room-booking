"use client"

import * as React from "react"
import { useTransition } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { AlertTriangleIcon, KeyRoundIcon, SearchIcon } from "lucide-react"

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
import { markCompleted, markMissing } from "@/lib/bookings/actions"
import { KEY_STATUS_COLORS } from "@/lib/bookings/types"
import { ApplicantCell } from "./applicant-cell"
import type { QueueBooking } from "./booking-queue-mapper"

export type ActiveReservation = QueueBooking & { isOverdue: boolean }

function RowActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await markCompleted(bookingId)
          })
        }
      >
        <KeyRoundIcon className="size-4" />
        Mark Returned
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await markMissing(bookingId)
          })
        }
      >
        <AlertTriangleIcon className="size-4" />
        Mark Missing
      </Button>
    </div>
  )
}

const columns: ColumnDef<ActiveReservation>[] = [
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
    id: "reservationStatus",
    header: "Status",
    size: 140,
    cell: ({ row }) =>
      row.original.isOverdue ? (
        <Badge variant="outline" className={KEY_STATUS_COLORS.overdue}>Overdue</Badge>
      ) : (
        <Badge variant="outline" className={KEY_STATUS_COLORS.in_process}>Collected</Badge>
      ),
  },
  {
    id: "action",
    header: "Action",
    size: 280,
    meta: { className: "text-right" },
    cell: ({ row }) => <RowActions bookingId={row.original.id} />,
  },
]

export function ActiveReservationsTable({ data }: { data: ActiveReservation[] }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<string>("all")

  const filteredData = React.useMemo(() => {
    if (status === "all") return data
    if (status === "overdue") return data.filter((booking) => booking.isOverdue)
    return data.filter((booking) => !booking.isOverdue)
  }, [data, status])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reservations..."
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
            <SelectItem value="collected">Collected</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredData} filterColumn="applicant" externalFilter={search} />
    </div>
  )
}
