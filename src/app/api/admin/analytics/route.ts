import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { analyticsQuerySchema } from "@/lib/validations";
import { WORKER_STATUS } from "@/lib/constants";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const validated = analyticsQuerySchema.parse({
      period,
      startDate,
      endDate,
    });

    let dateFilter: Date;
    switch (validated.period) {
      case "7d":
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(0);
    }

    const start = validated.startDate
      ? new Date(validated.startDate)
      : dateFilter;
    const end = validated.endDate ? new Date(validated.endDate) : new Date();

    const [revenueResult, servicesResult, workersResult, transactionsResult] =
      await Promise.all([
        serviceSupabase
          .from("transactions")
          .select("amount, created_at")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString()),
        serviceSupabase.from("services").select("category, id").limit(1000),
        serviceSupabase
          .from("worker_profiles")
          .select("id, full_name, total_earnings")
          .eq("verification_status", WORKER_STATUS.VERIFIED)
          .order("total_earnings", { ascending: false })
          .limit(10),
        serviceSupabase
          .from("transactions")
          .select("id, amount")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString()),
      ]);

    const transactions = revenueResult.data || [];
    const services = servicesResult.data || [];
    const workers = workersResult.data || [];
    const allTransactions = transactionsResult.data || [];

    const revenue = transactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );
    const commission = revenue * 0.1;
    const avgTransaction =
      allTransactions.length > 0 ? revenue / allTransactions.length : 0;

    const serviceDistribution = services.reduce(
      (acc: { [key: string]: { count: number; value: number } }, service) => {
        const category = service.category || "Other";
        if (!acc[category]) {
          acc[category] = { count: 0, value: 0 };
        }
        acc[category].count += 1;
        return acc;
      },
      {}
    );

    const topWorkers = workers.map((w) => ({
      id: w.id,
      name: w.full_name || "Unknown",
      earnings: Number(w.total_earnings || 0),
    }));

    return NextResponse.json({
      revenue: {
        total: revenue,
        commission,
        avgTransaction,
        count: allTransactions.length,
      },
      serviceDistribution: Object.entries(serviceDistribution).map(
        ([category, data]) => ({
          category,
          count: data.count,
          value: data.value,
        })
      ),
      topWorkers,
      period: validated.period,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
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

