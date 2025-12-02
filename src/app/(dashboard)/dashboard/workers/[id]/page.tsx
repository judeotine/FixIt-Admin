import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchWorkerById } from "@/lib/workers";
import { formatDate } from "@/lib/utils";

export default async function WorkerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = await fetchWorkerById(id);

  if (!worker) {
    notFound();
  }

  const statusColors: Record<string, string> = {
    verified: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    suspended: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/workers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={worker.name || "Worker Details"}
          description="View and manage worker information"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={worker.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {worker.name?.charAt(0)?.toUpperCase() || "W"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{worker.name}</h3>
                <Badge
                  variant="outline"
                  className={statusColors[worker.status] || ""}
                >
                  {worker.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{worker.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{worker.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Service Category</p>
                <p className="font-medium">{worker.service_category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date Joined</p>
                <p className="font-medium">
                  {formatDate(worker.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="text-2xl font-bold">
                {typeof worker.rating === "number"
                  ? `${worker.rating.toFixed(1)} ⭐`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{worker.total_jobs ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">
                UGX {(worker.total_earnings || 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

