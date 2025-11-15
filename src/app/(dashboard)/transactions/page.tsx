import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

async function getTransactions() {
  const supabase = await createServiceRoleClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data || [];
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    refunded: "bg-gray-100 text-gray-800",
    disputed: "bg-red-100 text-red-800",
  };

  const columns = [
    {
      key: "transaction_id",
      header: "Transaction ID",
    },
    {
      key: "created_at",
      header: "Date/Time",
      render: (value: string) =>
        new Date(value).toLocaleString(),
    },
    {
      key: "recruiter_id",
      header: "Recruiter",
      render: () => "Recruiter",
    },
    {
      key: "worker_id",
      header: "Worker",
      render: () => "Worker",
    },
    {
      key: "amount",
      header: "Amount",
      render: (value: number) => `UGX ${(value || 0).toLocaleString()}`,
    },
    {
      key: "platform_fee",
      header: "Platform Fee",
      render: (value: number) => `UGX ${(value || 0).toLocaleString()}`,
    },
    {
      key: "worker_payout",
      header: "Worker Payout",
      render: (value: number) => `UGX ${(value || 0).toLocaleString()}`,
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => (
        <Badge variant="outline" className={statusColors[value] || ""}>
          {value}
        </Badge>
      ),
    },
    {
      key: "payment_method",
      header: "Payment Method",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="View and manage all platform transactions"
        action={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />
      <DataTable
        data={transactions}
        columns={columns}
        searchable
        searchPlaceholder="Search transactions..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" },
              { value: "refunded", label: "Refunded" },
              { value: "disputed", label: "Disputed" },
            ],
          },
        ]}
      />
    </div>
  );
}

