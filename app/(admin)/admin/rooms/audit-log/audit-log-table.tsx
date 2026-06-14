"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type AuditAction = "created" | "updated_notes" | "status_changed" | "deleted"

export type AuditEntry = {
  id: string
  room_number: string
  action: AuditAction
  changes: Record<string, unknown> | null
  created_at: string
  profiles: { full_name: string } | null
}

const ACTION_LABELS: Record<AuditAction, string> = {
  created: "Created",
  updated_notes: "Updated Notes",
  status_changed: "Status Changed",
  deleted: "Deleted",
}

const ACTION_COLORS: Record<AuditAction, string> = {
  created: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  updated_notes: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  status_changed: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  deleted: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function describeChange(entry: AuditEntry) {
  const changes = entry.changes
  if (!changes) return "—"

  switch (entry.action) {
    case "created":
      return `Floor: ${changes.floor ?? "—"}`
    case "status_changed": {
      const status = changes.status as { from?: string; to?: string } | undefined
      if (!status) return "—"
      return `${status.from ?? "—"} → ${status.to ?? "—"}`
    }
    case "updated_notes": {
      const notes = changes.notes as { from?: string | null; to?: string | null } | undefined
      if (!notes) return "—"
      return `"${notes.from || "—"}" → "${notes.to || "—"}"`
    }
    case "deleted":
      return `Floor: ${changes.floor ?? "—"}, Status: ${changes.status ?? "—"}`
    default:
      return "—"
  }
}

export function AuditLogTable({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Performed By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatTimestamp(entry.created_at)}
              </TableCell>
              <TableCell className="font-medium">{entry.room_number}</TableCell>
              <TableCell>
                <Badge variant="outline" className={ACTION_COLORS[entry.action]}>
                  {ACTION_LABELS[entry.action]}
                </Badge>
              </TableCell>
              <TableCell className="max-w-80 truncate text-muted-foreground">
                {describeChange(entry)}
              </TableCell>
              <TableCell>{entry.profiles?.full_name ?? "—"}</TableCell>
            </TableRow>
          ))}
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No audit log entries yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
