import { PageHeader } from "@/components/shared/page-header";
import { WorkersTable } from "./workers-table";
import { fetchWorkersList } from "@/lib/workers";

export default async function WorkersPage() {
  const workers = await fetchWorkersList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workers Management"
        description="Manage and monitor all workers on the platform"
      />
      <WorkersTable
        data={workers.map((w) => ({
          ...w,
          avatar_url: w.avatar_url ?? undefined,
        }))}
      />
    </div>
  );
}

