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
import { RoomActions } from "./room-actions"

type Room = {
  id: string
  room_number: string
  floor: string
  status: "active" | "hidden"
  notes: string | null
}

export function RoomsTable({
  rooms,
  createRoomSlot,
}: {
  rooms: Room[]
  createRoomSlot: React.ReactNode
}) {
  const [search, setSearch] = useState("")
  const [floor, setFloor] = useState("all")
  const [availability, setAvailability] = useState("all")

  const floors = Array.from(new Set(rooms.map((room) => room.floor))).sort()

  const filteredRooms = rooms.filter((room) => {
    if (floor !== "all" && room.floor !== floor) return false
    if (availability !== "all" && room.status !== availability) return false

    const query = search.trim().toLowerCase()
    if (!query) return true
    return (
      room.room_number.toLowerCase().includes(query) ||
      room.floor.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by room number or floor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
          {createRoomSlot}
        </div>
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Number</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-12 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.room_number}</TableCell>
                <TableCell>{room.floor}</TableCell>
                <TableCell>
                  <Badge variant={room.status === "active" ? "default" : "secondary"}>
                    {room.status === "active" ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-64 truncate text-muted-foreground">
                  {room.notes || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <RoomActions room={room} />
                </TableCell>
              </TableRow>
            ))}
            {filteredRooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No rooms found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
