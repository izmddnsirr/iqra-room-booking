import type { Metadata } from "next";

import {
  CalendarIcon,
  CircleDollarSignIcon,
  BuildingIcon,
  KeyRoundIcon,
} from "lucide-react";

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Room Rules",
};

const roomRules = [
  { icon: <CalendarIcon className="size-4 shrink-0 text-primary" />, text: "Rental period: minimum 1 month, maximum 3 months" },
  { icon: <CircleDollarSignIcon className="size-4 shrink-0 text-primary" />, text: "Payment: RM20 per month — credited to SMAP" },
  { icon: <BuildingIcon className="size-4 shrink-0 text-primary" />, text: "Rooms available on Level 2 and Level 4 only" },
  { icon: <KeyRoundIcon className="size-4 shrink-0 text-primary" />, text: "Key collected at counter after receptionist confirmation" },
];

export default function RoomRulesPage() {
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
                <BreadcrumbPage>Room Rules</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Iqra Room Rules</h2>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Rule</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomRules.map((rule, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {rule.icon}
                        {rule.text}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
