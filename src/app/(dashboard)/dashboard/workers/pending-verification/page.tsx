import { PageHeader } from "@/components/shared/page-header";
import { fetchWorkersList } from "@/lib/workers";
import { WORKER_STATUS } from "@/lib/constants";
import { PendingVerificationTable } from "./pending-table";

export default async function PendingVerificationPage() {
  const workers = await fetchWorkersList({
    status: WORKER_STATUS.PENDING,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Verifications"
        description="Review and approve worker verification requests"
      />
      <PendingVerificationTable data={workers} />
    </div>
  );
}

