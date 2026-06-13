"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowRightIcon, HourglassIcon, CheckCircleIcon, CircleIcon, ClockIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"

import { DataTable } from "@/components/ui/data-table"
import { BOOKING_STATUS_LABELS, type BookingStatus } from "@/lib/bookings/types"

export type RecentBooking = {
  room: string
  duration: string
  status: BookingStatus
}

const statusConfig: Record<BookingStatus, { icon: React.ReactNode; className: string }> = {
  pending: {
    icon: <ClockIcon className="size-3" />,
    className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
  },
  approved: {
    icon: <CheckCircleIcon className="size-3" />,
    className: "inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700",
  },
  rejected: {
    icon: <XCircleIcon className="size-3" />,
    className: "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700",
  },
  ready_for_collection: {
    icon: <CheckCircleIcon className="size-3" />,
    className: "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700",
  },
  in_process: {
    icon: <HourglassIcon className="size-3" />,
    className: "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700",
  },
  completed: {
    icon: <CircleIcon className="size-3" />,
    className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
  },
  cancelled: {
    icon: <XCircleIcon className="size-3" />,
    className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
  },
}

const columns: ColumnDef<RecentBooking>[] = [
  {
    accessorKey: "room",
    header: "Room",
    cell: ({ row }) => <span className="font-semibold">{row.getValue("room")}</span>,
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("duration")}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as BookingStatus
      const config = statusConfig[status]
      return (
        <span className={config.className}>
          {config.icon}
          {BOOKING_STATUS_LABELS[status]}
        </span>
      )
    },
  },
]

export function RecentBookingsTable({ data }: { data: RecentBooking[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent Bookings</h2>
        <Link href="/booking/status" className="text-sm text-primary flex items-center gap-1 hover:underline whitespace-nowrap">
          View all <ArrowRightIcon className="size-3" />
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={data}
        showPagination={false}
      />
    </div>
  )
}
