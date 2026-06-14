"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBookingDate, formatBookingPeriod } from "@/lib/bookings/format"
import { chargePenalty, markFound } from "@/lib/bookings/actions"
import { KEY_STATUS_COLORS, type BookingStatus } from "@/lib/bookings/types"
import { ApplicantCell } from "./applicant-cell"
import type { QueueBooking } from "./booking-queue-mapper"

function MissingActionMenu({ bookingId, penaltyCharged }: { bookingId: string; penaltyCharged: boolean }) {
  const [isPending, startTransition] = React.useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" disabled={isPending}>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => startTransition(async () => { await markFound(bookingId) })}>
          Mark as Found
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={penaltyCharged}
          onSelect={() => startTransition(async () => { await chargePenalty(bookingId) })}
        >
          {penaltyCharged ? "Penalty Charged" : "Charge Penalty (RM50)"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const historyStatusBadge: Record<BookingStatus, { label: string; className?: string; variant: "default" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "outline" },
  ready_for_collection: { label: "Ready for Pickup", variant: "outline" },
  in_process: { label: "In Process", variant: "outline" },
  completed: { label: "Returned", variant: "outline", className: KEY_STATUS_COLORS.completed },
  cancelled: { label: "Cancelled", variant: "destructive" },
  rejected: { label: "Rejected", variant: "destructive" },
  missing: { label: "Missing", variant: "outline", className: KEY_STATUS_COLORS.missing },
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
      const badge = historyStatusBadge[row.getValue("status") as BookingStatus]
      return (
        <div className="flex flex-col gap-1">
          <Badge variant={badge.variant} className={badge.className}>{badge.label}</Badge>
          {row.original.penaltyChargedAt && (
            <span className="text-xs text-muted-foreground">
              RM{Number(row.original.penaltyAmount).toFixed(2)} charged
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "closedDate",
    header: "Closed Date",
    size: 140,
    cell: ({ row }) => formatBookingDate(row.original.closedDate),
  },
  {
    id: "action",
    header: "Action",
    size: 60,
    cell: ({ row }) => {
      if (row.original.status !== "missing") return null
      return <MissingActionMenu bookingId={row.original.id} penaltyCharged={!!row.original.penaltyChargedAt} />
    },
  },
]

export function KeyHistoryTable({ data }: { data: QueueBooking[] }) {
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
            placeholder="Search records..."
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
            <SelectItem value="missing">Missing</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        filterColumn="applicant"
        externalFilter={search}
        paginationLabel="records"
      />
    </div>
  )
}
