"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ROOM_RULES } from "@/lib/bookings/room-rules"

export function RoomRulesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Room Rules
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Iqra Room Rules</DialogTitle>
          <DialogDescription aria-describedby={undefined} />
        </DialogHeader>
        <div className="max-h-[70vh] space-y-6 overflow-y-auto rounded-xl border bg-muted/40 p-4 text-sm">
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
      </DialogContent>
    </Dialog>
  )
}
