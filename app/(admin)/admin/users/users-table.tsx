"use client"

import { useState } from "react"
import { SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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

type Profile = {
  id: string
  full_name: string
  email: string
  matric_staff_id: string
  phone_number: string
  role: string
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  receptionist: "Receptionist",
  user: "User",
}

export function UsersTable({
  profiles,
  createUserSlot,
}: {
  profiles: Profile[]
  createUserSlot: React.ReactNode
}) {
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")

  const filteredProfiles = profiles.filter((profile) => {
    if (role !== "all" && profile.role !== role) return false

    const query = search.trim().toLowerCase()
    if (!query) return true
    return (
      profile.full_name.toLowerCase().includes(query) ||
      profile.email.toLowerCase().includes(query) ||
      profile.matric_staff_id.toLowerCase().includes(query) ||
      profile.phone_number.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, ID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {createUserSlot}
        </div>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Matric No / Staff ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.full_name}</TableCell>
                <TableCell>{profile.matric_staff_id}</TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>{profile.phone_number}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {filteredProfiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
