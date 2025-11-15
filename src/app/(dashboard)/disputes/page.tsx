import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DisputesTable } from "./disputes-table";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disputes Management"
        description="Review and resolve platform disputes"
      />
      <DisputesTable data={disputes} />
    </div>
  );
}

