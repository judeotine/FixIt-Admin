"use client";

import { DataTable } from "@/components/shared/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_spent: number;
  total_bookings: number;
  created_at: string;
  avatar_url?: string;
}

export function RecruitersTable({ data }: { data: Recruiter[] }) {
  const columns = [
    {
      key: "avatar",
      header: "",
      render: (_: any, row: Recruiter) => (
        <Avatar>
        <AvatarImage src={row.avatar_url} />
        <AvatarFallback>
            {row.name?.charAt(0)?.toUpperCase() || "R"}
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
      key: "total_spent",
      header: "Total Spent",
      render: (value: number) => `UGX ${(value || 0).toLocaleString()}`,
    },
    {
      key: "total_bookings",
      header: "Total Bookings",
    },
    {
      key: "created_at",
      header: "Date Joined",
      render: (value: string) => formatDate(value),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: Recruiter) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/recruiters/${row.id}`}>
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
      searchPlaceholder="Search by name, email, phone..."
    />
  );
}
