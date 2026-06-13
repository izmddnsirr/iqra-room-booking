import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth";

export default async function ReceptionistLayout({
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

  const { count: inProcessCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_process");

  const { count: readyForCollectionCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "ready_for_collection");

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: profile.full_name,
          email: profile.email,
          role: profile.role as Role,
        }}
        inProcessCount={inProcessCount ?? 0}
        readyForCollectionCount={readyForCollectionCount ?? 0}
      />
      {children}
    </SidebarProvider>
  );
}
