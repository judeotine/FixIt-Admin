import { NextResponse } from "next/server";
import { deleteSession, getSession } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const session = await getSession();
    
    if (session) {
      const supabase = await createServiceRoleClient();
      await supabase.from("admin_audit_logs").insert({
        admin_id: session.adminId,
        action: "LOGOUT",
        resource_type: "AUTH",
      });
    }

    await deleteSession();

    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}
