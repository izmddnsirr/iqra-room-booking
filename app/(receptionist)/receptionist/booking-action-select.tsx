"use client"

import { useTransition } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type BookingAction = {
  value: string
  label: string
  onAction: (bookingId: string) => Promise<unknown>
}

export function BookingActionSelect({
  bookingId,
  actions,
  placeholder = "Select Action",
}: {
  bookingId: string
  actions: BookingAction[]
  placeholder?: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <Select
      disabled={isPending}
      onValueChange={(value) => {
        const action = actions.find((a) => a.value === value)
        if (!action) return
        startTransition(async () => {
          await action.onAction(bookingId)
        })
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {actions.map((action) => (
          <SelectItem key={action.value} value={action.value}>
            {action.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
