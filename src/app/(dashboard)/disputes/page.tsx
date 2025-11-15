import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

async function getDisputes() {
  const supabase = await createServiceRoleClient();
  const { data, error } = await supabase
    .from("disputes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data || [];
}

export default async function DisputesPage() {
  const disputes = await getDisputes();

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
      render: (value: string) => new Date(value).toLocaleDateString(),
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
      render: (value: string) => (value ? value.substring(0, 50) + "..." : "N/A"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: any) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/disputes/${row.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disputes Management"
        description="Review and resolve platform disputes"
      />
      <DataTable
        data={disputes}
        columns={columns}
        searchable
        searchPlaceholder="Search disputes..."
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "under_review", label: "Under Review" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ],
          },
        ]}
      />
    </div>
  );
}

