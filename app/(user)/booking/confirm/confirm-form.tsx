"use client";

import * as React from "react";
import { useActionState } from "react";
import { InfoIcon } from "lucide-react";
import { addMonths, format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { createBooking } from "@/lib/bookings/actions";
import { MONTHLY_RATE } from "../booking-form";
import type { Room } from "../booking-form";

export function ConfirmForm({
  room,
  startDate,
  rentalMonths,
}: {
  room: Room;
  startDate: Date;
  rentalMonths: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createBooking, undefined);

  React.useEffect(() => {
    if (state?.success) {
      toast.success("Booking submitted! Awaiting admin approval.");
      router.push("/booking/status");
    }
  }, [state, router]);

  const endDate = addMonths(startDate, rentalMonths);
  const totalAmount = MONTHLY_RATE * rentalMonths;

  return (
    <form action={formAction} className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Booking summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <SummaryRow label="Room" value={room.room_number} />
            <SummaryRow label="Floor" value={room.floor} />
            <SummaryRow label="Start date" value={format(startDate, "d MMM yyyy")} />
            <SummaryRow label="End date" value={format(endDate, "d MMM yyyy")} />
            <SummaryRow
              label="Duration"
              value={`${rentalMonths} month${rentalMonths > 1 ? "s" : ""}`}
            />
            <SummaryRow label="Rental rate" value={`RM ${MONTHLY_RATE.toFixed(2)} / month`} />

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Total amount</span>
              <span className="text-lg font-bold text-primary">
                RM {totalAmount.toFixed(2)}
              </span>
            </div>

            {state?.error && (
              <Field>
                <FieldError>{state.error}</FieldError>
              </Field>
            )}
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Submitting..." : "Submit booking"}
            </Button>
          </CardFooter>
        </Card>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            Bookings must be approved by an admin before the key can be
            collected at the counter.
          </p>
        </div>
      </div>

      <input type="hidden" name="room_id" value={room.id} />
      <input type="hidden" name="start_date" value={startDate.toISOString().slice(0, 10)} />
      <input type="hidden" name="rental_months" value={rentalMonths} />
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
