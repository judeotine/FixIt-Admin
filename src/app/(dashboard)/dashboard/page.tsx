import { createServiceRoleClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { RevenueChart, ServiceDistributionChart, TopWorkersChart, UserGrowthChart } from "@/components/dashboard/charts/chart-wrapper";
import { Button } from "@/components/ui/button";
import { UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const supabase = await createServiceRoleClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [workersResult, recruitersResult, transactionsResult, bookingsResult] =
    await Promise.all([
      supabase
        .from("workers")
        .select("id, status, total_earnings, rating")
        .eq("status", "verified"),
      supabase.from("recruiters").select("id").limit(1000),
      supabase
        .from("transactions")
        .select("id, amount, status, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("bookings")
        .select("id, status")
        .eq("status", "active")
        .limit(1000),
    ]);

  const workers = workersResult.data || [];
  const recruiters = recruitersResult.data || [];
  const transactions = transactionsResult.data || [];
  const bookings = bookingsResult.data || [];

  const totalActiveWorkers = workers.length;
  const totalRecruiters = recruiters.length;
  const todayTransactions = transactions.filter(
    (t) => new Date(t.created_at).toDateString() === new Date().toDateString()
  );
  const todayTransactionsValue = todayTransactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );
  const monthlyRevenue = transactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );
  const platformCommission = monthlyRevenue * 0.1;
  const averageRating =
    workers.length > 0
      ? workers.reduce((sum, w) => sum + (w.rating || 0), 0) / workers.length
      : 0;
  const activeBookings = bookings.length;

  const pendingVerificationsResult = await supabase
    .from("workers")
    .select("id")
    .eq("status", "pending")
    .limit(1000);

  const pendingVerifications = pendingVerificationsResult.data?.length || 0;

  const revenueData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dayTransactions = transactions.filter(
      (t) => new Date(t.created_at).toDateString() === date.toDateString()
    );
    return {
      date: date.toISOString(),
      amount: dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    };
  });

  const serviceDistributionResult = await supabase
    .from("services")
    .select("category, id")
    .limit(1000);

  const services = serviceDistributionResult.data || [];
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

  const topWorkersResult = await supabase
    .from("workers")
    .select("id, name, total_earnings")
    .eq("status", "verified")
    .order("total_earnings", { ascending: false })
    .limit(10);

  const topWorkers =
    topWorkersResult.data?.map((w) => ({
      id: w.id,
      name: w.name || "Unknown",
      earnings: w.total_earnings || 0,
    })) || [];

  const userGrowthData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString(),
      workers: Math.floor(Math.random() * 10) + 1,
      recruiters: Math.floor(Math.random() * 5) + 1,
    };
  });

  const recentTransactionsResult = await supabase
    .from("transactions")
    .select(
      "id, transaction_id, created_at, amount, status, recruiter_id, worker_id"
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const recentTransactions =
    recentTransactionsResult.data?.map((t) => ({
      id: t.id,
      transaction_id: t.transaction_id || t.id,
      date_time: t.created_at,
      recruiter_name: "Recruiter",
      worker_name: "Worker",
      amount: t.amount || 0,
      status: (t.status as any) || "pending",
    })) || [];

  return {
    stats: {
      totalActiveWorkers,
      totalRecruiters,
      todayTransactions: {
        count: todayTransactions.length,
        value: todayTransactionsValue,
      },
      pendingVerifications,
      monthlyRevenue,
      platformCommission,
      averageRating: averageRating.toFixed(1),
      activeBookings,
    },
    revenueData,
    serviceDistribution: Object.entries(serviceDistribution).map(
      ([category, data]) => ({
        category,
        count: data.count,
        value: data.value,
      })
    ),
    topWorkers,
    userGrowthData,
    recentTransactions,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your platform metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/workers/pending-verification">
              <UserCheck className="mr-2 h-4 w-4" />
              Pending Verifications ({data.stats.pendingVerifications})
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/disputes">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Active Disputes
            </Link>
          </Button>
        </div>
      </div>

      <StatsCards
        stats={[
          {
            title: "Total Active Workers",
            value: data.stats.totalActiveWorkers,
            description: "Verified workers on platform",
          },
          {
            title: "Total Recruiters",
            value: data.stats.totalRecruiters,
            description: "Active recruiters",
          },
          {
            title: "Today's Transactions",
            value: `UGX ${data.stats.todayTransactions.value.toLocaleString()}`,
            description: `${data.stats.todayTransactions.count} transactions`,
          },
          {
            title: "Pending Verifications",
            value: data.stats.pendingVerifications,
            description: "Workers awaiting approval",
          },
          {
            title: "Monthly Revenue",
            value: `UGX ${data.stats.monthlyRevenue.toLocaleString()}`,
            description: "Last 30 days",
          },
          {
            title: "Platform Commission",
            value: `UGX ${data.stats.platformCommission.toLocaleString()}`,
            description: "10% of revenue",
          },
          {
            title: "Average Rating",
            value: data.stats.averageRating,
            description: "Worker ratings",
          },
          {
            title: "Active Bookings",
            value: data.stats.activeBookings,
            description: "Currently active",
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart data={data.revenueData} />
        <ServiceDistributionChart data={data.serviceDistribution} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TopWorkersChart data={data.topWorkers} />
        <UserGrowthChart data={data.userGrowthData} />
      </div>

      <RecentTransactions transactions={data.recentTransactions} />
    </div>
  );
}

