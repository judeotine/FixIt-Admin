import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { WorkersTable } from "./workers-table";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers Management"
        description="Manage and monitor all workers on the platform"
      />
      <WorkersTable data={workers} />
    </div>
  );
}

