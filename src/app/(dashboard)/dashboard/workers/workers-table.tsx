"use client";

import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_category: string;
  status: string;
  rating: number | null;
  total_jobs: number;
  total_earnings: number;
  created_at: string;
  avatar_url?: string;
}

export function WorkersTable({ data }: { data: Worker[] }) {
  const columns = [
    {
      key: "avatar",
      header: "",
      render: (_: unknown, row: Worker) => (
        <Avatar>
          <AvatarImage src={row.avatar_url} />
          <AvatarFallback>
            {row.name?.charAt(0)?.toUpperCase() || "W"}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: "name",
      header: "Name",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "service_category",
      header: "Service Category",
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => {
        const colors: Record<string, string> = {
          verified: "bg-green-100 text-green-800",
          pending: "bg-yellow-100 text-yellow-800",
          suspended: "bg-red-100 text-red-800",
        };
        return (
          <Badge variant="outline" className={colors[value] || ""}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: "rating",
      header: "Rating",
      render: (value: number) => (value ? `${value.toFixed(1)} ⭐` : "N/A"),
    },
    {
      key: "total_jobs",
      header: "Total Jobs",
    },
    {
      key: "total_earnings",
      header: "Total Earnings",
      render: (value: number) => `UGX ${(value || 0).toLocaleString()}`,
    },
    {
      key: "created_at",
      header: "Date Joined",
      render: (value: string) => formatDate(value),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: unknown, row: Worker) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/workers/${row.id}`}>
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
      searchPlaceholder="Search by name, service, status..."
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "verified", label: "Verified" },
            { value: "pending", label: "Pending" },
            { value: "suspended", label: "Suspended" },
          ],
        },
      ]}
    />
  );
}
