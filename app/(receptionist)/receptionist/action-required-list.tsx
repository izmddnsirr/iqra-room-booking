import Link from "next/link"
import { ArrowRightIcon, MapPinIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { KEY_STATUS_COLORS } from "@/lib/bookings/types"

export type ActionItem = {
  id: string
  applicant: string
  room: string
  floor: string
  detail: string
  variant: "overdue" | "ready"
  href: string
}

export function ActionRequiredList({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Nothing needs your attention right now.
      </div>
    )
  }

  return (
    <div className="divide-y rounded-xl border">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span
              className={`mt-1 size-2 shrink-0 rounded-full ${
                item.variant === "overdue" ? "bg-orange-500" : "bg-blue-500"
              }`}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{item.applicant}</span>
                <Badge
                  variant="outline"
                  className={item.variant === "overdue" ? KEY_STATUS_COLORS.overdue : KEY_STATUS_COLORS.ready_for_collection}
                >
                  {item.variant === "overdue" ? "Overdue" : "Ready for Pickup"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPinIcon className="size-3.5" />
                <span>
                  Room {item.room}, Floor {item.floor}
                </span>
                <span className={item.variant === "overdue" ? "font-medium text-orange-600 dark:text-orange-400" : ""}>
                  {item.detail}
                </span>
              </div>
            </div>
          </div>
          <Link
            href={item.href}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View Details
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      ))}
    </div>
  )
}
