"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, startOfToday } from "date-fns";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const RENTAL_PERIODS = [
  { value: 1, label: "1 month" },
  { value: 2, label: "2 months" },
  { value: 3, label: "3 months" },
];

export const MONTHLY_RATE = 20;

export type Room = {
  id: string;
  room_number: string;
  floor: string;
  is_available: boolean;
  notes: string | null;
};

export function BookingForm({ rooms }: { rooms: Room[] }) {
  const router = useRouter();
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [rentalMonths, setRentalMonths] = React.useState(1);
  const [selectedRoomId, setSelectedRoomId] = React.useState(rooms[0]?.id);

  const floors = Array.from(new Set(rooms.map((room) => room.floor)));
  const tabs = ["All", ...floors];

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  function handleNext() {
    if (!selectedRoomId || !startDate) return;
    const params = new URLSearchParams({
      room_id: selectedRoomId,
      start_date: startDate.toISOString().slice(0, 10),
      rental_months: String(rentalMonths),
    });
    router.push(`/booking/confirm?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Start date</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-auto w-full justify-between py-3 text-base font-semibold"
              >
                {startDate ? format(startDate, "d MMM yyyy") : "Pick a date"}
                <CalendarIcon className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={{ before: startOfToday() }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Rental period</span>
          <div className="grid grid-cols-3 gap-2">
            {RENTAL_PERIODS.map((period) => (
              <Button
                key={period.value}
                type="button"
                variant="outline"
                aria-pressed={rentalMonths === period.value}
                onClick={() => setRentalMonths(period.value)}
                className={cn(
                  "h-auto py-3 text-base font-semibold",
                  rentalMonths === period.value &&
                    "border-primary bg-primary/5 text-primary"
                )}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Select a room</span>
        <Tabs defaultValue="All">
          <TabsList className="mx-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid grid-cols-3 gap-3">
                {rooms
                  .filter((room) => tab === "All" || room.floor === tab)
                  .map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      selected={selectedRoomId === room.id}
                      onSelect={() => setSelectedRoomId(room.id)}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="sticky bottom-0 -mx-4 -mb-4 flex items-center justify-between gap-4 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80">
        <span className="text-sm text-muted-foreground">
          {selectedRoom
            ? `Selected: ${selectedRoom.room_number} (${selectedRoom.floor})`
            : "Select a room to continue"}
        </span>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!selectedRoom || !startDate}
        >
          Next: Review booking
        </Button>
      </div>
    </div>
  );
}

function RoomCard({
  room,
  selected,
  onSelect,
}: {
  room: Room;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!room.is_available}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "relative flex flex-col gap-1 rounded-2xl border bg-muted/50 p-4 text-left transition-colors",
        room.is_available
          ? "cursor-pointer hover:bg-muted"
          : "cursor-not-allowed text-muted-foreground",
        selected &&
          "border-primary bg-primary/5 text-primary hover:bg-primary/5"
      )}
    >
      <Badge
        variant="outline"
        className={cn(
          "absolute top-3 right-3 w-fit gap-1.5 border-transparent",
          room.is_available
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            room.is_available ? "bg-emerald-500" : "bg-rose-400"
          )}
        />
        {room.is_available ? "Available" : "Unavailable"}
      </Badge>
      <span className="pr-20 font-semibold">{room.room_number}</span>
      <span
        className={cn(
          "text-sm",
          selected ? "text-primary" : "text-muted-foreground"
        )}
      >
        {room.floor}
      </span>
      {room.notes && (
        <span className="mt-1 text-xs text-muted-foreground">
          Note: {room.notes}
        </span>
      )}
    </button>
  );
}
