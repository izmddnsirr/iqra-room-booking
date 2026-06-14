"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RENTAL_GUIDELINES } from "@/lib/bookings/rental-guidelines"

export function RentalGuidelinesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Rental Guidelines
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Iqra Room Rental Guidelines</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto rounded-xl border bg-muted/40 p-4 text-sm">
          <ol className="list-none space-y-2.5 pl-1">
            {RENTAL_GUIDELINES.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-muted-foreground">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  )
}
