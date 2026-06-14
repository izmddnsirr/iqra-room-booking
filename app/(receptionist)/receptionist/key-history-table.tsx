"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { chargePenalty, markFound, markMissing, revertToInProcess } from "@/lib/bookings/actions"
import { KEY_STATUS_COLORS, KEY_STATUS_LABELS, type BookingStatus } from "@/lib/bookings/types"
import { ApplicantCell } from "./applicant-cell"
import type { QueueBooking } from "./booking-queue-mapper"

function BookingDetailsDialog({ booking, open, onOpenChange }: { booking: QueueBooking; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>Room {booking.room} ({booking.floor})</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <DetailRow label="Applicant" value={booking.applicant} />
          <DetailRow label="Email" value={booking.applicantEmail} />
          <DetailRow label="Matric/Staff ID" value={booking.applicantMatricStaffId} />
          <DetailRow label="Phone" value={booking.applicantPhone} />
          <DetailRow label="Room" value={`${booking.room} (${booking.floor})`} />
          <DetailRow label="Period" value={formatBookingPeriod(booking.startDate, booking.endDate)} />
          <DetailRow label="Rental Duration" value={`${booking.rentalMonths} month${booking.rentalMonths > 1 ? "s" : ""}`} />
          <DetailRow label="Monthly Rate" value={`RM${Number(booking.monthlyRate).toFixed(2)}`} />
          <DetailRow label="Total Amount" value={`RM${Number(booking.totalAmount).toFixed(2)}`} />
          <DetailRow label="Status" value={KEY_STATUS_LABELS[booking.status]} />
          <DetailRow label="Closed Date" value={formatBookingDate(booking.closedDate)} />
          {booking.penaltyChargedAt && (
            <DetailRow label="Penalty Charged" value={`RM${Number(booking.penaltyAmount).toFixed(2)} on ${formatBookingDate(booking.penaltyChargedAt)}`} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-1.5 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function RowActionMenu({ booking }: { booking: QueueBooking }) {
  const [isPending, startTransition] = React.useTransition()
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const penaltyCharged = !!booking.penaltyChargedAt

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" disabled={isPending}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setDetailsOpen(true)}>
            View Details
          </DropdownMenuItem>
          {booking.status === "missing" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => startTransition(async () => { await markFound(booking.id) })}>
                Mark as Found
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={penaltyCharged}
                onSelect={() => startTransition(async () => { await chargePenalty(booking.id) })}
              >
                {penaltyCharged ? "Penalty Charged" : "Charge Penalty (RM50)"}
              </DropdownMenuItem>
            </>
          )}
          {booking.status === "completed" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => startTransition(async () => { await markMissing(booking.id) })}
              >
                Mark as Missing
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => startTransition(async () => { await revertToInProcess(booking.id) })}
              >
                Revert to In Process
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <BookingDetailsDialog booking={booking} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  )
}

const historyStatusBadge: Record<BookingStatus, { label: string; className?: string; variant: "default" | "destructive" | "outline" }> = {
  approved: { label: "Approved", variant: "outline" },
  key_prepared: { label: "Key Prepared", variant: "outline", className: KEY_STATUS_COLORS.key_prepared },
  ready_for_collection: { label: "Ready for Pickup", variant: "outline" },
  in_process: { label: "In Process", variant: "outline" },
  completed: { label: "Returned", variant: "outline", className: KEY_STATUS_COLORS.completed },
  cancelled: { label: "Cancelled", variant: "destructive" },
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
    size: 120,
    cell: ({ row }) => formatBookingDate(row.original.closedDate),
  },
  {
    id: "action",
    header: "Action",
    size: 60,
    meta: { className: "text-right" },
    cell: ({ row }) => <RowActionMenu booking={row.original} />,
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
