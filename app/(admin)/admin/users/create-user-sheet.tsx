"use client"

import { useActionState, useState } from "react"
import { PlusIcon } from "lucide-react"

import { createUser } from "./actions"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function CreateUserSheet() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createUser, undefined)
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
          Create User
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create User</SheetTitle>
          <SheetDescription>
            Create a login for a user, receptionist, or administrator.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
                <Input id="full_name" name="full_name" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="matric_staff_id">Matric No / Staff ID</FieldLabel>
                <Input id="matric_staff_id" name="matric_staff_id" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone_number">Phone Number</FieldLabel>
                <Input id="phone_number" name="phone_number" type="tel" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" required minLength={6} />
              </Field>
              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Select name="role" required defaultValue="user">
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {state?.error && <FieldError>{state.error}</FieldError>}
            </FieldGroup>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create User"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
