import type { Metadata } from "next";

import { AlertTriangleIcon, KeyRoundIcon } from "lucide-react";

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
import { BOOKING_QUEUE_SELECT, mapQueueBookings } from "./booking-queue-mapper";
import { ActionRequiredList, type ActionItem } from "./action-required-list";

export const metadata: Metadata = {
  title: "Receptionist Dashboard",
};

export default async function ReceptionistDashboardPage() {
  const supabase = await createClient();

  const [
    { count: readyCount },
    { data: inProcess },
    { data: readyForCollection },
  ] = await Promise.all([
    supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "ready_for_collection"),
    supabase
      .from("bookings")
      .select(BOOKING_QUEUE_SELECT)
      .eq("status", "in_process")
      .order("end_date", { ascending: true }),
    supabase
      .from("bookings")
      .select(BOOKING_QUEUE_SELECT)
      .eq("status", "ready_for_collection")
      .order("created_at", { ascending: true }),
  ]);

  const today = new Date().toISOString().slice(0, 10);

  const inProcessBookings = mapQueueBookings(inProcess);
  const readyBookings = mapQueueBookings(readyForCollection);

  const overdue = inProcessBookings.filter((booking) => booking.endDate < today);

  const stats = [
    {
      label: "Ready for Pickup",
      value: readyCount ?? 0,
      description: "Awaiting collection at desk",
      icon: <KeyRoundIcon className="size-5 text-blue-600" />,
      labelClassName: "text-blue-600",
    },
    {
      label: "Overdue",
      value: overdue.length,
      description: "Requires immediate attention",
      icon: <AlertTriangleIcon className="size-5 text-orange-600" />,
      labelClassName: "text-orange-600",
    },
  ];

  const overdueItems: ActionItem[] = overdue.map((booking) => {
    const daysOverdue = Math.floor(
      (new Date(today).getTime() - new Date(booking.endDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: booking.id,
      applicant: booking.applicant,
      room: booking.room,
      floor: booking.floor,
      detail: `${daysOverdue} ${daysOverdue === 1 ? "day" : "days"} overdue`,
      variant: "overdue",
      href: "/receptionist/in-process",
    };
  });

  const readyItems: ActionItem[] = readyBookings.map((booking) => ({
    id: booking.id,
    applicant: booking.applicant,
    room: booking.room,
    floor: booking.floor,
    detail: "Awaiting pickup",
    variant: "ready",
    href: "/receptionist/ready-collection",
  }));

  const actionItems = [...overdueItems, ...readyItems];

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
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of today&apos;s key handover activity.</p>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Morning Briefing</h2>
          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className={`text-sm font-medium ${stat.labelClassName}`}>
                    {stat.label}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent className="space-y-1">
                  <span className="text-3xl font-semibold">{stat.value}</span>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Action Required</h2>
          <ActionRequiredList items={actionItems} />
        </div>
      </div>
    </SidebarInset>
  );
}
