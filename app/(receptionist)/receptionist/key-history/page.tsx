import type { Metadata } from "next";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_QUEUE_SELECT, mapQueueBookings } from "../booking-queue-mapper";
import { KeyHistoryTable } from "../key-history-table";

export const metadata: Metadata = {
  title: "Key History",
};

export default async function KeyHistoryPage() {
  const supabase = await createClient();

  const { data: history } = await supabase
    .from("bookings")
    .select(BOOKING_QUEUE_SELECT)
    .in("status", ["completed", "cancelled", "missing"])
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
                <BreadcrumbPage>Key History</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-lg font-semibold">Key History</h1>
          <p className="text-sm text-muted-foreground">Closed records and audit trail.</p>
        </div>
        <KeyHistoryTable data={mapQueueBookings(history)} />
      </div>
    </SidebarInset>
  );
}
