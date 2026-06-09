import type { Metadata } from "next";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BookingsTable, type Booking } from "@/app/(user)/dashboard/bookings-table";

export const metadata: Metadata = {
  title: "Booking Status",
};

const bookings: Booking[] = [
  { id: "BK-001", room: "Discussion Room A", date: "10 Jun 2026", time: "09:00 – 11:00", status: "Approved" },
  { id: "BK-002", room: "Seminar Hall 1", date: "11 Jun 2026", time: "14:00 – 16:00", status: "Pending" },
  { id: "BK-003", room: "Meeting Room B", date: "13 Jun 2026", time: "10:00 – 12:00", status: "Approved" },
  { id: "BK-004", room: "Discussion Room C", date: "15 Jun 2026", time: "08:00 – 09:00", status: "Pending" },
  { id: "BK-005", room: "Seminar Hall 2", date: "18 Jun 2026", time: "13:00 – 15:00", status: "Rejected" },
];

export default function BookingStatusPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
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
                  <BreadcrumbPage>Booking Status</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <BookingsTable data={bookings} title="My Bookings" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
