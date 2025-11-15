import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { RecruitersTable } from "./recruiters-table";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruiters Management"
        description="Manage and monitor all recruiters on the platform"
      />
      <RecruitersTable data={recruiters} />
    </div>
  );
}

