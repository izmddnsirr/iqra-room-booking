import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/auth";

export default async function AdminLayout({
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

  const { count: allBookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });

  const { count: pendingApprovalsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: profile.full_name,
          email: profile.email,
          role: profile.role as Role,
        }}
        allBookingsCount={allBookingsCount ?? 0}
        pendingApprovalsCount={pendingApprovalsCount ?? 0}
      />
      {children}
    </SidebarProvider>
  );
}
