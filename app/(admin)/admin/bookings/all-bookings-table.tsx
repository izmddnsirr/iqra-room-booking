"use client"

import { useState, useTransition } from "react"
import { MoreHorizontalIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { forceCancelBooking, issueWarning } from "@/lib/bookings/actions"
import { KEY_STATUS_COLORS, KEY_STATUS_LABELS, type BookingStatus } from "@/lib/bookings/types"

const STATUS_FILTER_OPTIONS: BookingStatus[] = [
  "approved",
  "key_prepared",
  "ready_for_collection",
  "in_process",
  "completed",
  "missing",
]
import { formatBookingPeriod } from "@/lib/bookings/format"

export type AdminBooking = {
  id: string
  applicant: string
  room: string
  floor: string
  startDate: string
  endDate: string
  totalAmount: number
  status: BookingStatus
}

const statusBadgeClassName: Record<BookingStatus, string | undefined> = {
  approved: KEY_STATUS_COLORS.approved,
  key_prepared: KEY_STATUS_COLORS.key_prepared,
  ready_for_collection: KEY_STATUS_COLORS.ready_for_collection,
  in_process: KEY_STATUS_COLORS.in_process,
  completed: KEY_STATUS_COLORS.completed,
  cancelled: KEY_STATUS_COLORS.cancelled,
  missing: KEY_STATUS_COLORS.missing,
}

export function AllBookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [floor, setFloor] = useState("all")

  const floors = Array.from(new Set(bookings.map((booking) => booking.floor))).sort()

  const filtered = bookings.filter((booking) => {
    if (status !== "all" && booking.status !== status) return false
    if (floor !== "all" && booking.floor !== floor) return false

    const query = search.trim().toLowerCase()
    if (!query) return true
    return (
      booking.applicant.toLowerCase().includes(query) ||
      booking.room.toLowerCase().includes(query) ||
      booking.floor.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by applicant or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_FILTER_OPTIONS.map((value) => (
                <SelectItem key={value} value={value}>{KEY_STATUS_LABELS[value]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={floor} onValueChange={setFloor}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {floors.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.applicant}</TableCell>
                <TableCell>{booking.room}</TableCell>
                <TableCell>{booking.floor}</TableCell>
                <TableCell>{formatBookingPeriod(booking.startDate, booking.endDate)}</TableCell>
                <TableCell>RM {booking.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusBadgeClassName[booking.status]}>
                    {KEY_STATUS_LABELS[booking.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RowActionMenu booking={booking} />
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const CANCELLABLE_STATUSES: BookingStatus[] = [
  "approved",
  "key_prepared",
  "ready_for_collection",
  "in_process",
  "missing",
]

function RowActionMenu({ booking }: { booking: AdminBooking }) {
  const [isPending, startTransition] = useTransition()
  const [warningOpen, setWarningOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [message, setMessage] = useState("")

  const canForceCancel = CANCELLABLE_STATUSES.includes(booking.status)

  function handleIssueWarning() {
    startTransition(async () => {
      const result = await issueWarning(booking.id, message)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Warning issued.")
      setMessage("")
      setWarningOpen(false)
    })
  }

  function handleForceCancel() {
    startTransition(async () => {
      const result = await forceCancelBooking(booking.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Booking cancelled.")
      setCancelOpen(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" disabled={isPending}>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setWarningOpen(true)}>
            Issue Warning
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!canForceCancel}
            onSelect={() => setCancelOpen(true)}
          >
            Force Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Warning</DialogTitle>
            <DialogDescription>
              Send a warning notice to {booking.applicant} regarding Room {booking.room}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe the violation..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleIssueWarning} disabled={isPending || !message.trim()}>
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the rental for {booking.applicant} (Room {booking.room}) immediately due to a rule
              violation. No compensation or refund will be given. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceCancel} disabled={isPending}>
              Force Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
