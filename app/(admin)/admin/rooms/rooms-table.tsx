"use client"

import { useState } from "react"
import { SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  is_available: boolean
  is_visible: boolean
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

  const filteredRooms = rooms.filter((room) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    return (
      room.room_number.toLowerCase().includes(query) ||
      room.floor.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by room number or floor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {createRoomSlot}
      </div>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Number</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.room_number}</TableCell>
                <TableCell>{room.floor}</TableCell>
                <TableCell>
                  <Badge variant={room.is_available ? "default" : "secondary"}>
                    {room.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={room.is_visible ? "default" : "secondary"}>
                    {room.is_visible ? "Visible" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-64 truncate text-muted-foreground">
                  {room.notes || "—"}
                </TableCell>
                <TableCell>
                  <RoomActions room={room} />
                </TableCell>
              </TableRow>
            ))}
            {filteredRooms.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
