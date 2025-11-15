import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";

async function getWorkers() {
  const supabase = await createServiceRoleClient();
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data || [];
}

export default async function WorkersPage() {
  const workers = await getWorkers();

  const columns = [
    {
      key: "avatar",
      header: "",
      render: (_: any, row: any) => (
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
      render: (value: string) =>
        new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: any) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/workers/${row.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers Management"
        description="Manage and monitor all workers on the platform"
      />
      <DataTable
        data={workers}
        columns={columns}
        searchable
        searchPlaceholder="Search by name, email, phone..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "all", label: "All" },
              { value: "verified", label: "Verified" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
            ],
          },
          {
            key: "category",
            label: "Category",
            options: [
              { value: "all", label: "All" },
              { value: "plumber", label: "Plumber" },
              { value: "electrician", label: "Electrician" },
              { value: "carpenter", label: "Carpenter" },
            ],
          },
        ]}
      />
    </div>
  );
}

