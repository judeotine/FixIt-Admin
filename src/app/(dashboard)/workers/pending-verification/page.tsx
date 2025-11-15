import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { VerificationModal } from "@/components/workers/verification-modal";
import { CheckCircle, XCircle } from "lucide-react";

async function getPendingWorkers() {
  const supabase = await createServiceRoleClient();
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data || [];
}

export default async function PendingVerificationPage() {
  const workers = await getPendingWorkers();

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
      key: "created_at",
      header: "Date Applied",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "documents",
      header: "Documents Status",
      render: () => (
        <Badge variant="outline" className="bg-yellow-50">
          Pending Review
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: any, row: any) => (
        <VerificationModal workerId={row.id} workerName={row.name} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Verifications"
        description="Review and approve worker verification requests"
      />
      <DataTable data={workers} columns={columns} searchable />
    </div>
  );
}

