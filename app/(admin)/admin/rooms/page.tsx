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
import { CreateRoomSheet } from "./create-room-sheet";
import { RoomsTable } from "./rooms-table";

export const metadata: Metadata = {
  title: "Manage Rooms",
};

export default async function AdminRoomsPage() {
  const supabase = await createClient();
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, room_number, floor, is_available, is_visible, notes")
    .order("sort_order", { ascending: true });

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
                <BreadcrumbPage>Manage Rooms</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
          <h1 className="text-lg font-semibold">Manage Rooms</h1>
          <p className="text-sm text-muted-foreground">View and manage room availability.</p>
        </div>
        <RoomsTable rooms={rooms ?? []} createRoomSlot={<CreateRoomSheet />} />
      </div>
    </SidebarInset>
  );
}
