"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowRightIcon, HourglassIcon, CheckCircleIcon, CircleIcon } from "lucide-react"
import Link from "next/link"

import { DataTable } from "@/components/ui/data-table"

export type RecentBookingStatus = "In Process" | "Ready for Collection" | "Completed"

export type RecentBooking = {
  room: string
  duration: string
  status: RecentBookingStatus
}

const statusConfig: Record<RecentBookingStatus, { icon: React.ReactNode; className: string }> = {
  "In Process": {
    icon: <HourglassIcon className="size-3" />,
    className: "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700",
  },
  "Ready for Collection": {
    icon: <CheckCircleIcon className="size-3" />,
    className: "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700",
  },
  "Completed": {
    icon: <CircleIcon className="size-3" />,
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
      const status = row.getValue("status") as RecentBookingStatus
      const config = statusConfig[status]
      return (
        <span className={config.className}>
          {config.icon}
          {status}
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
