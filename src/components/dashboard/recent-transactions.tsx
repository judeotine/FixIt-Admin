"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Transaction {
  id: string;
  transaction_id: string;
  date_time: string;
  recruiter_name: string;
  worker_name: string;
  amount: number;
  status: "pending" | "completed" | "refunded" | "disputed";
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading?: boolean;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  refunded: "bg-gray-100 text-gray-800",
  disputed: "bg-red-100 text-red-800",
};

export function RecentTransactions({
  transactions,
  loading,
}: RecentTransactionsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent transactions
            </p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {transaction.worker_name} → {transaction.recruiter_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date_time), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    UGX {transaction.amount.toLocaleString()}
                  </p>
                  <Badge
                    variant="outline"
                    className={statusColors[transaction.status]}
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

