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
import { markCompleted } from "@/lib/bookings/actions";
import { BookingQueueTable } from "../booking-queue-table";
import { BOOKING_QUEUE_SELECT, mapQueueBookings } from "../booking-queue-mapper";

export const metadata: Metadata = {
  title: "In Process",
};

export default async function InProcessPage() {
  const supabase = await createClient();

  const { data: inProcess } = await supabase
    .from("bookings")
    .select(BOOKING_QUEUE_SELECT)
    .eq("status", "in_process")
    .order("created_at", { ascending: true });

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
                <BreadcrumbPage>In Process</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <BookingQueueTable
          bookings={mapQueueBookings(inProcess)}
          action={{ label: "Mark Returned", onAction: markCompleted }}
        />
      </div>
    </SidebarInset>
  );
}
