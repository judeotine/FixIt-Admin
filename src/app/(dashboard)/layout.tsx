import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const supabase = await createServiceRoleClient();
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", session.adminId)
    .eq("role", "admin")
    .eq("is_active", true)
    .single();

  if (!adminUser) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        user={{
          name: adminUser.name,
          email: adminUser.email,
          avatar: adminUser.avatar_url || undefined,
        }}
      />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
