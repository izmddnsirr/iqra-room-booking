import type { Metadata } from "next";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { AuditLogTable, type AuditEntry } from "./audit-log-table";

type AuditRow = Omit<AuditEntry, "profiles"> & {
  profiles: { full_name: string }[] | { full_name: string } | null;
};

function normalizeEntries(rows: AuditRow[]): AuditEntry[] {
  return rows.map((row) => ({
    ...row,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles,
  }));
}

export const metadata: Metadata = {
  title: "Room Audit Log",
};

export default async function RoomAuditLogPage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("room_audit_log")
    .select("id, room_number, action, changes, created_at, profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/rooms">Manage Rooms</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Room Audit Log</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-lg font-semibold">Room Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            History of changes made to the room inventory.
          </p>
        </div>
        <AuditLogTable entries={normalizeEntries(entries ?? [])} />
      </div>
    </SidebarInset>
  );
}
