import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";

async function getRecruiters() {
  const supabase = await createServiceRoleClient();
  const { data, error } = await supabase
    .from("recruiters")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data || [];
}

export default async function RecruitersPage() {
  const recruiters = await getRecruiters();

  const columns = [
    {
      key: "avatar",
      header: "",
      render: (_: any, row: any) => (
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
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: any) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/recruiters/${row.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruiters Management"
        description="Manage and monitor all recruiters on the platform"
      />
      <DataTable
        data={recruiters}
        columns={columns}
        searchable
        searchPlaceholder="Search by name, email, phone..."
      />
    </div>
  );
}

