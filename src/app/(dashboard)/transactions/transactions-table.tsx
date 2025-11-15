"use client";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  transaction_id?: string;
  created_at: string;
  recruiter_id: string;
  worker_id: string;
  amount?: number;
  platform_fee?: number;
  worker_payout?: number;
  status: string;
  payment_method?: string;
}

export function TransactionsTable({ data }: { data: Transaction[] }) {
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
      render: (value: string) => new Date(value).toLocaleString(),
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
    <DataTable
      data={data}
      columns={columns}
      searchable
      searchPlaceholder="Search transactions..."
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
            { value: "refunded", label: "Refunded" },
            { value: "disputed", label: "Disputed" },
          ],
        },
      ]}
    />
  );
}
