"use client"

import { useActionState, useState, useTransition } from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { deleteRoom, toggleRoomAvailability, toggleRoomVisibility, updateRoomNotes } from "./actions"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

type Room = {
  id: string
  room_number: string
  is_available: boolean
  is_visible: boolean
  notes: string | null
}

export function RoomActions({ room }: { room: Room }) {
  const [notesOpen, setNotesOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [notesState, notesAction, notesPending] = useActionState(updateRoomNotes, undefined)
  const [lastHandledNotesState, setLastHandledNotesState] = useState(notesState)

  if (notesState?.success && notesState !== lastHandledNotesState) {
    setLastHandledNotesState(notesState)
    setNotesOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontalIcon />
            <span className="sr-only">Open actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setNotesOpen(true)}>
            Edit notes
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await toggleRoomAvailability(room.id, !room.is_available)
              })
            }
          >
            Mark as {room.is_available ? "unavailable" : "available"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await toggleRoomVisibility(room.id, !room.is_visible)
              })
            }
          >
            {room.is_visible ? "Hide room" : "Unhide room"}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            Delete room
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Notes — {room.room_number}</SheetTitle>
            <SheetDescription>Internal notes about this room.</SheetDescription>
          </SheetHeader>
          <form action={notesAction} className="px-4">
            <input type="hidden" name="room_id" value={room.id} />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="notes">Notes</FieldLabel>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={room.notes ?? ""}
                  rows={5}
                />
              </Field>
              {notesState?.error && <FieldError>{notesState.error}</FieldError>}
            </FieldGroup>
            <SheetFooter className="px-0">
              <Button type="submit" disabled={notesPending}>
                {notesPending ? "Saving..." : "Save Notes"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {room.room_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the room. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteRoom(room.id)
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
