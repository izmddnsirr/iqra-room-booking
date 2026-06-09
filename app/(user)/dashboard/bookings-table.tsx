"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDownIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"

export type BookingStatus = "Approved" | "Pending" | "Rejected"

export type Booking = {
  id: string
  room: string
  date: string
  time: string
  status: BookingStatus
}

const statusVariant: Record<BookingStatus, "default" | "outline" | "destructive"> = {
  Approved: "default",
  Pending: "outline",
  Rejected: "destructive",
}

const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "id",
    header: "Booking ID",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("id")}</span>
    ),
  },
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
    cell: ({ row }) => <span className="font-medium">{row.getValue("room")}</span>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDownIcon className="ml-2 size-3.5" />
      </Button>
    ),
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as BookingStatus
      return <Badge variant={statusVariant[status]}>{status}</Badge>
    },
  },
]

export function BookingsTable({ data, title = "Upcoming Bookings" }: { data: Booking[]; title?: string }) {
  const [filter, setFilter] = React.useState("")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
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
