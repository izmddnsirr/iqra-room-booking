import type { Metadata } from "next";

import {
  Breadcrumb,
  BreadcrumbItem,
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
import { BOOKING_QUEUE_SELECT, mapQueueBookings } from "../../../../(receptionist)/receptionist/booking-queue-mapper";
import { OverdueMissingTable } from "../../overdue-missing-table";

export const metadata: Metadata = {
  title: "Overdue & Missing",
};

export default async function OverdueMissingPage() {
  const supabase = await createClient();

  const [{ data: inProcessBookings }, { data: missingBookings }] = await Promise.all([
    supabase
      .from("bookings")
      .select(BOOKING_QUEUE_SELECT)
      .eq("status", "in_process")
      .order("end_date", { ascending: true }),
    supabase
      .from("bookings")
      .select(BOOKING_QUEUE_SELECT)
      .eq("status", "missing")
      .order("end_date", { ascending: true }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const inProcess = mapQueueBookings(inProcessBookings).map((booking) => ({
    ...booking,
    isOverdue: booking.endDate < today,
  }));
  const overdue = inProcess.filter((booking) => booking.isOverdue);
  const missing = mapQueueBookings(missingBookings).map((booking) => ({ ...booking, isOverdue: false }));
  const overdueMissingData = [...overdue, ...missing];

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
                <a href="/admin/bookings" className="text-muted-foreground hover:text-foreground">All Bookings</a>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Overdue &amp; Missing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-lg font-semibold">Overdue &amp; Missing</h1>
          <p className="text-sm text-muted-foreground">Bookings that are overdue or have missing keys.</p>
        </div>
        <OverdueMissingTable bookings={overdueMissingData} />
      </div>
    </SidebarInset>
  );
}
