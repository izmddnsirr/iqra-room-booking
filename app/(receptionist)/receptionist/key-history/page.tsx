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
import { BookingQueueTable } from "../booking-queue-table";
import { BOOKING_QUEUE_SELECT, mapQueueBookings } from "../booking-queue-mapper";

export const metadata: Metadata = {
  title: "Key History",
};

export default async function KeyHistoryPage() {
  const supabase = await createClient();

  const { data: history } = await supabase
    .from("bookings")
    .select(BOOKING_QUEUE_SELECT)
    .in("status", ["completed", "cancelled", "rejected"])
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
        <BookingQueueTable bookings={mapQueueBookings(history)} />
      </div>
    </SidebarInset>
  );
}
