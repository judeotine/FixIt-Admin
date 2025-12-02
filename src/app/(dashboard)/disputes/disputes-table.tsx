"use client";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Dispute {
  id: string;
  dispute_id?: string;
  created_at: string;
  recruiter_id: string;
  worker_id: string;
  amount?: number;
  status: string;
  description?: string;
}

export function DisputesTable({ data }: { data: Dispute[] }) {
  const statusColors: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-800",
    under_review: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const columns = [
    {
      key: "dispute_id",
      header: "Dispute ID",
    },
    {
      key: "created_at",
      header: "Date Raised",
      render: (value: string) => formatDate(value),
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
      key: "status",
      header: "Status",
      render: (value: string) => (
        <Badge variant="outline" className={statusColors[value] || ""}>
          {value.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (value: string) =>
        value ? value.substring(0, 50) + "..." : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: Dispute) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/disputes/${row.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      searchable
      searchPlaceholder="Search disputes..."
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "open", label: "Open" },
            { value: "under_review", label: "Under Review" },
            { value: "resolved", label: "Resolved" },
            { value: "closed", label: "Closed" },
          ],
        },
      ]}
    />
  );
}
