import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { verifyWorkerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceSupabase = await createServiceRoleClient();
    const { data: adminUser } = await serviceSupabase
      .from("admin_users")
      .select("*")
      .eq("email", user.email)
      .eq("role", "admin")
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workerId, status, rejectionReason } = verifyWorkerSchema.parse(body);

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const { data: worker, error: workerError } = await serviceSupabase
      .from("workers")
      .select("*")
      .eq("id", workerId)
      .single();

    if (workerError || !worker) {
      return NextResponse.json(
        { error: "Worker not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      status: status === "approved" ? "verified" : "suspended",
    };

    const { error: updateError } = await serviceSupabase
      .from("workers")
      .update(updateData)
      .eq("id", workerId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update worker" },
        { status: 500 }
      );
    }

    await serviceSupabase.from("admin_audit_logs").insert({
      admin_id: adminUser.id,
      action: `worker_${status}`,
      resource_type: "worker",
      resource_id: workerId,
      details: {
        worker_id: workerId,
        status,
        rejection_reason: rejectionReason,
        previous_status: worker.status,
      },
      ip_address: ipAddress,
      user_agent: request.headers.get("user-agent") || null,
    });

    return NextResponse.json({
      success: true,
      worker: {
        ...worker,
        status: updateData.status,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

