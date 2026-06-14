"use client"

import { useActionState, useState } from "react"
import { PlusIcon } from "lucide-react"

import { createRoom } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function CreateRoomSheet() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createRoom, undefined)
  const [lastHandledState, setLastHandledState] = useState(state)

  if (state?.success && state !== lastHandledState) {
    setLastHandledState(state)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusIcon />
          Create Room
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Room</SheetTitle>
          <SheetDescription>
            Add a new room. Notes and availability can be managed afterward.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="room_number">Room Number</FieldLabel>
                <Input id="room_number" name="room_number" placeholder="Iqra 101" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="floor">Floor</FieldLabel>
                <Input id="floor" name="floor" placeholder="Level 2" required />
              </Field>
              {state?.error && <FieldError>{state.error}</FieldError>}
            </FieldGroup>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Room"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
