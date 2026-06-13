import type { Metadata } from "next";

import { HourglassIcon, KeyRoundIcon, CheckCircleIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { markCollected, markCompleted, markReadyForCollection } from "@/lib/bookings/actions";
import { BookingQueueTable } from "./booking-queue-table";
import { BOOKING_QUEUE_SELECT, mapQueueBookings } from "./booking-queue-mapper";

export const metadata: Metadata = {
  title: "Receptionist Dashboard",
};

export default async function ReceptionistDashboardPage() {
  const supabase = await createClient();

  const [
    { count: inProcessCount },
    { count: readyCount },
    { count: completedCount },
    { data: awaitingKey },
    { data: readyForCollection },
    { data: inProcess },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "in_process"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "ready_for_collection"),
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase
      .from("bookings")
      .select(BOOKING_QUEUE_SELECT)
      .eq("status", "approved")
      .order("created_at", { ascending: true }),
    supabase
      .from("bookings")
      .select(BOOKING_QUEUE_SELECT)
      .eq("status", "ready_for_collection")
      .order("created_at", { ascending: true }),
    supabase
      .from("bookings")
      .select(BOOKING_QUEUE_SELECT)
      .eq("status", "in_process")
      .order("created_at", { ascending: true }),
  ]);

  const stats = [
    {
      label: "In Process",
      value: inProcessCount ?? 0,
      icon: <HourglassIcon className="size-5 text-muted-foreground" />,
    },
    {
      label: "Ready for Collection",
      value: readyCount ?? 0,
      icon: <KeyRoundIcon className="size-5 text-muted-foreground" />,
    },
    {
      label: "Total Completed",
      value: completedCount ?? 0,
      icon: <CheckCircleIcon className="size-5 text-muted-foreground" />,
    },
  ];

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
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-semibold">{stat.value}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Awaiting Key Preparation</h2>
          <BookingQueueTable
            bookings={mapQueueBookings(awaitingKey)}
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
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">In Process</h2>
          <BookingQueueTable
            bookings={mapQueueBookings(inProcess)}
            action={{ label: "Mark Returned", onAction: markCompleted }}
          />
        </div>
      </div>
    </SidebarInset>
  );
}
