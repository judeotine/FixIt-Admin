import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionsTable } from "./transactions-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

async function getTransactions() {
  const supabase = await createServiceRoleClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data || [];
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="View and manage all platform transactions"
        action={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />
      <TransactionsTable data={transactions} />
    </div>
  );
}

