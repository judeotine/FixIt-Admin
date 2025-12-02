"use client";

import { DataTable } from "@/components/shared/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VerificationModal } from "@/components/workers/verification-modal";
import type { WorkerRecord } from "@/lib/workers";
import { formatDate } from "@/lib/utils";

interface PendingTableProps {
  data: WorkerRecord[];
}

export function PendingVerificationTable({ data }: PendingTableProps) {
  const columns = [
    {
      key: "avatar",
      header: "",
      render: (_: unknown, row: WorkerRecord) => (
        <Avatar>
          <AvatarImage src={row.avatar_url || undefined} />
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
      key: "email",
      header: "Email",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "created_at",
      header: "Date Applied",
      render: (value: string) => formatDate(value),
    },
    {
      key: "documents",
      header: "Documents Status",
      render: (_: unknown, row: WorkerRecord) => {
        const docsComplete = Boolean(row.national_id_url);
        return (
          <Badge
            variant="outline"
            className={docsComplete ? "bg-green-50" : "bg-yellow-50"}
          >
            {docsComplete ? "Submitted" : "Awaiting Upload"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: unknown, row: WorkerRecord) => (
        <VerificationModal worker={row} />
      ),
    },
  ];

  return <DataTable data={data} columns={columns} searchable />;
}

