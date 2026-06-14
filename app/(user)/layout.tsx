import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { RentalGuidelinesDialog } from "./rental-guidelines-dialog";
import { RoomRulesDialog } from "./room-rules-dialog";
import { UserMenu } from "./user-menu";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b bg-background px-6 py-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ptta.png" alt="PTTA logo" className="size-8 object-contain" />
          <span className="font-semibold">Iqra Room</span>
        </div>
        <div className="flex items-center gap-6">
          <RentalGuidelinesDialog />
          <RoomRulesDialog />
          <UserMenu name={profile.full_name ?? "User"} email={profile.email ?? user.email ?? ""} />
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
