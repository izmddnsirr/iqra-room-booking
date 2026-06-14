"use client"

import * as React from "react"
import { useActionState } from "react"
import { addMonths, format, startOfToday } from "date-fns"
import { CalendarIcon, CheckIcon, InfoIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBooking } from "@/lib/bookings/actions"
import { ROOM_RULES } from "@/lib/bookings/room-rules"
import { cn } from "@/lib/utils"

const MONTHLY_RATE = 20

const RENTAL_PERIODS = [
  { value: 1, label: "1 Month" },
  { value: 2, label: "2 Months" },
  { value: 3, label: "3 Months" },
]

export type Room = {
  id: string
  room_number: string
  floor: string
  is_available: boolean
  notes: string | null
}

export type ActiveBooking = {
  room_id: string
  start_date: string
  end_date: string
}

type Step = "rules" | "details" | "summary"

export function BookRoomDialog({
  rooms,
  activeBookings,
}: {
  rooms: Room[]
  activeBookings: ActiveBooking[]
}) {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<Step>("rules")
  const [agreed, setAgreed] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | undefined>(() => new Date())
  const [rentalMonths, setRentalMonths] = React.useState(1)
  const [floorFilter, setFloorFilter] = React.useState("All")
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | undefined>(undefined)
  const [state, formAction, pending] = useActionState(createBooking, undefined)

  const floors = Array.from(new Set(rooms.map((room) => room.floor)))
  const floorTabs = ["All", ...floors]

  const isRoomAvailable = React.useCallback(
    (room: Room) => {
      if (!room.is_available) return false
      if (!startDate) return true

      const start = format(startDate, "yyyy-MM-dd")
      const end = addMonths(startDate, rentalMonths)
      const endStr = format(end, "yyyy-MM-dd")

      const hasOverlap = activeBookings.some(
        (booking) =>
          booking.room_id === room.id &&
          start < booking.end_date &&
          booking.start_date < endStr
      )

      return !hasOverlap
    },
    [activeBookings, startDate, rentalMonths]
  )

  const selectedRoom = rooms.find(
    (room) => room.id === selectedRoomId && isRoomAvailable(room)
  )

  const endDate = startDate ? addMonths(startDate, rentalMonths) : undefined
  const totalAmount = MONTHLY_RATE * rentalMonths

  React.useEffect(() => {
    if (state?.success) {
      toast.success("Booking confirmed! We're preparing your key.")
      handleOpenChange(false)
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setStep("rules")
      setAgreed(false)
      setStartDate(new Date())
      setRentalMonths(1)
      setFloorFilter("All")
      setSelectedRoomId(undefined)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="size-4" />
          Book a Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book a Room</DialogTitle>
        </DialogHeader>

        <Stepper step={step} />

        <form action={formAction} className="space-y-4">
          <div className="space-y-4">
            {step === "rules" && (
              <div className="space-y-4">
                <h3 className="font-semibold">Please read the rules carefully</h3>
                <div className="max-h-64 space-y-4 overflow-y-auto rounded-lg border bg-muted/40 p-4 text-sm">
                  {ROOM_RULES.map((section, sectionIndex) => {
                    const startNumber =
                      ROOM_RULES.slice(0, sectionIndex).reduce((sum, s) => sum + s.items.length, 0) + 1
                    return (
                      <div key={section.heading} className="space-y-2">
                        <p className="font-semibold">{section.heading}</p>
                        <ol className="list-none space-y-1.5 pl-1">
                          {section.items.map((item, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="shrink-0 text-muted-foreground">{startNumber + i}.</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )
                  })}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
                  I have read and agree to the Room Rules
                </label>
              </div>
            )}

            {step === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Start Date</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-full justify-between font-normal"
                        >
                          {startDate ? format(startDate, "d MMM yyyy") : "Pick a date"}
                          <CalendarIcon className="text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          disabled={{ before: startOfToday() }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Duration</span>
                    <Select value={String(rentalMonths)} onValueChange={(v) => setRentalMonths(Number(v))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RENTAL_PERIODS.map((period) => (
                          <SelectItem key={period.value} value={String(period.value)}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm">
                  End Date: <span className="font-semibold">{endDate ? format(endDate, "d MMM yyyy") : "—"}</span>
                </p>

                <div className="space-y-2">
                  <h3 className="font-semibold">Select a Room</h3>
                  <Tabs value={floorFilter} onValueChange={setFloorFilter}>
                    <TabsList>
                      {floorTabs.map((tab) => (
                        <TabsTrigger key={tab} value={tab}>
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {floorTabs.map((tab) => (
                      <TabsContent key={tab} value={tab}>
                        <div className="grid max-h-64 grid-cols-3 gap-3 overflow-y-auto pr-1">
                          {rooms
                            .filter((room) => tab === "All" || room.floor === tab)
                            .map((room) => {
                              const available = isRoomAvailable(room)
                              const selected = selectedRoomId === room.id
                              return (
                                <button
                                  key={room.id}
                                  type="button"
                                  disabled={!available}
                                  onClick={() => setSelectedRoomId(room.id)}
                                  className={cn(
                                    "rounded-lg border p-3 text-left transition-colors",
                                    available
                                      ? "cursor-pointer hover:bg-muted"
                                      : "cursor-not-allowed bg-muted/50 text-muted-foreground",
                                    selected && "border-primary bg-primary/5 text-primary"
                                  )}
                                >
                                  <p className="font-semibold">{room.room_number}</p>
                                  <p className="text-xs text-muted-foreground">{room.floor}</p>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "mt-2 gap-1.5 border-transparent px-0 text-xs",
                                      available ? "text-emerald-600" : "text-muted-foreground"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "size-1.5 rounded-full",
                                        available ? "bg-emerald-500" : "bg-muted-foreground"
                                      )}
                                    />
                                    {available ? "Available" : "Unavailable"}
                                  </Badge>
                                </button>
                              )
                            })}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            )}

            {step === "summary" && selectedRoom && startDate && endDate && (
              <div className="space-y-4">
                <h3 className="font-semibold">Booking Summary</h3>
                <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
                  <SummaryRow label="Room" value={`${selectedRoom.room_number} (${selectedRoom.floor})`} />
                  <SummaryRow label="Duration" value={RENTAL_PERIODS.find((p) => p.value === rentalMonths)?.label ?? ""} />
                  <SummaryRow label="Period" value={`${format(startDate, "d MMM yyyy")} – ${format(endDate, "d MMM yyyy")}`} />
                  <Separator />
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>RM {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                  <InfoIcon className="size-4 shrink-0" />
                  <p>The amount will be credited into the SMAP Account.</p>
                </div>

                <input type="hidden" name="room_id" value={selectedRoom.id} />
                <input type="hidden" name="start_date" value={format(startDate, "yyyy-MM-dd")} />
                <input type="hidden" name="rental_months" value={rentalMonths} />
              </div>
            )}
          </div>

          <DialogFooter className="-mx-6 -mb-6 border-t px-6 pt-4 pb-6">
            {step === "rules" && (
              <>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" onClick={() => setStep("details")} disabled={!agreed}>
                  Next
                </Button>
              </>
            )}
            {step === "details" && (
              <>
                <Button type="button" variant="outline" onClick={() => setStep("rules")}>
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep("summary")}
                  disabled={!selectedRoom || !startDate}
                >
                  Next
                </Button>
              </>
            )}
            {step === "summary" && (
              <>
                <Button type="button" variant="outline" onClick={() => setStep("details")}>
                  Back
                </Button>
                <Button type="submit" disabled={pending}>
                  <CheckIcon className="size-4" />
                  {pending ? "Submitting..." : "Confirm Booking"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Stepper({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "rules", label: "Room Rules" },
    { key: "details", label: "Date & Room" },
    { key: "summary", label: "Summary" },
  ]
  const currentIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                i <= currentIndex
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                i <= currentIndex ? "text-primary" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-3 h-px flex-1",
                i < currentIndex ? "bg-primary" : "bg-muted-foreground/20"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
