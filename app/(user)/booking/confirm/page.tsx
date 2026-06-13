import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
import { ConfirmForm } from "./confirm-form";

export const metadata: Metadata = {
  title: "Confirm Booking",
};

export default async function BookingConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ room_id?: string; start_date?: string; rental_months?: string }>;
}) {
  const params = await searchParams;
  const roomId = params.room_id;
  const startDateParam = params.start_date;
  const rentalMonths = Number(params.rental_months);

  if (!roomId || !startDateParam || !Number.isInteger(rentalMonths) || rentalMonths < 1 || rentalMonths > 3) {
    redirect("/booking");
  }

  const supabase = await createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("id, room_number, floor, is_available, notes")
    .eq("id", roomId)
    .eq("is_visible", true)
    .single();

  if (!room) {
    redirect("/booking");
  }

  const startDate = new Date(startDateParam);

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
                <BreadcrumbLink href="/booking">New Booking</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Confirm Booking</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <ConfirmForm room={room} startDate={startDate} rentalMonths={rentalMonths} />
    </SidebarInset>
  );
}
