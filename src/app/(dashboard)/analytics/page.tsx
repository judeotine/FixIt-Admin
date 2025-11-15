import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart, ServiceDistributionChart, TopWorkersChart, UserGrowthChart } from "@/components/dashboard/charts/chart-wrapper";

async function getAnalyticsData() {
  const supabase = await createServiceRoleClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [revenueResult, servicesResult, workersResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("services").select("category, id").limit(1000),
    supabase
      .from("workers")
      .select("id, name, total_earnings")
      .eq("status", "verified")
      .order("total_earnings", { ascending: false })
      .limit(10),
  ]);

  const transactions = revenueResult.data || [];
  const services = servicesResult.data || [];
  const workers = workersResult.data || [];

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
    name: w.name || "Unknown",
    earnings: w.total_earnings || 0,
  }));

  const userGrowthData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString(),
      workers: Math.floor(Math.random() * 10) + 1,
      recruiters: Math.floor(Math.random() * 5) + 1,
    };
  });

  const totalRevenue = transactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );
  const commission = totalRevenue * 0.1;
  const avgTransaction = transactions.length > 0 ? totalRevenue / transactions.length : 0;

  return {
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
    metrics: {
      totalRevenue,
      commission,
      avgTransaction,
      totalTransactions: transactions.length,
    },
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Comprehensive platform analytics and insights"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {data.metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {data.metrics.commission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">10% of revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {data.metrics.avgTransaction.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart data={data.revenueData} />
        <ServiceDistributionChart data={data.serviceDistribution} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TopWorkersChart data={data.topWorkers} />
        <UserGrowthChart data={data.userGrowthData} />
      </div>
    </div>
  );
}

