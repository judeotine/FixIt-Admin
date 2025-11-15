import { createServiceRoleClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

async function getServices() {
  const supabase = await createServiceRoleClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return data || [];
}

export default async function ServicesPage() {
  const services = await getServices();

  const columns = [
    {
      key: "name",
      header: "Service Name",
    },
    {
      key: "category",
      header: "Category",
    },
    {
      key: "base_price",
      header: "Base Price",
      render: (value: number) => `UGX ${(value || 0).toLocaleString()}`,
    },
    {
      key: "is_active",
      header: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (value: string) => (value ? value.substring(0, 50) + "..." : "N/A"),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services Management"
        description="Manage service categories and pricing"
      />
      <DataTable
        data={services}
        columns={columns}
        searchable
        searchPlaceholder="Search services..."
      />
    </div>
  );
}

