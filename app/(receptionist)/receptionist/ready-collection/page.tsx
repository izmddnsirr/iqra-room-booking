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
import { markCollected, markReadyForCollection } from "@/lib/bookings/actions";
import { BookingQueueTable } from "../booking-queue-table";
import { BOOKING_QUEUE_SELECT, mapQueueBookings } from "../booking-queue-mapper";

export const metadata: Metadata = {
  title: "Ready for Collection",
};

export default async function ReadyCollectionPage() {
  const supabase = await createClient();

  const { data: approved } = await supabase
    .from("bookings")
    .select(BOOKING_QUEUE_SELECT)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  const { data: readyForCollection } = await supabase
    .from("bookings")
    .select(BOOKING_QUEUE_SELECT)
    .eq("status", "ready_for_collection")
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
                <BreadcrumbPage>Ready for Collection</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Awaiting Key Preparation</h2>
          <BookingQueueTable
            bookings={mapQueueBookings(approved)}
            action={{ label: "Mark Ready", onAction: markReadyForCollection }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Ready for Collection</h2>
          <BookingQueueTable
            bookings={mapQueueBookings(readyForCollection)}
            action={{ label: "Hand Over Key", onAction: markCollected }}
          />
        </div>
      </div>
    </SidebarInset>
  );
}
