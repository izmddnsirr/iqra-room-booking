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
import { AllBookingsTable, type AdminBooking } from "./all-bookings-table";
import type { BookingStatus } from "@/lib/bookings/types";

export const metadata: Metadata = {
  title: "Manage Bookings",
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, start_date, end_date, total_amount, status, profiles(full_name), rooms(room_number, floor)")
    .order("created_at", { ascending: false });

  const data: AdminBooking[] = (bookings ?? []).map((booking) => {
    const profile = booking.profiles as unknown as { full_name: string } | null;
    const room = booking.rooms as unknown as { room_number: string; floor: string } | null;
    return {
      id: booking.id,
      applicant: profile?.full_name ?? "—",
      room: room?.room_number ?? "—",
      floor: room?.floor ?? "—",
      startDate: booking.start_date,
      endDate: booking.end_date,
      totalAmount: Number(booking.total_amount),
      status: booking.status as BookingStatus,
    };
  });

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
                <BreadcrumbPage>All Bookings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-lg font-semibold">All Bookings</h1>
          <p className="text-sm text-muted-foreground">View and manage all room bookings.</p>
        </div>
        <AllBookingsTable bookings={data} />
      </div>
    </SidebarInset>
  );
}
