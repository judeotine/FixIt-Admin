import { createServiceRoleClient } from "@/lib/supabase/server";
import { WORKER_STATUS } from "@/lib/constants";
import type { Tables } from "@/types/database.types";

type WorkerProfileRow = Tables<"worker_profiles">;
type UserProfileRow = Tables<"user_profiles">;

export interface WorkerRecord {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  service_category: string;
  status: string;
  created_at: string;
  avatar_url?: string | null;
  rating: number | null;
  total_jobs: number;
  total_earnings: number;
  onboarding_completed: boolean;
  national_id_url: string;
  certification_url: string | null;
}

interface WorkerFilters {
  status?: string;
  limit?: number;
  orderBy?: {
    column: keyof WorkerProfileRow;
    ascending?: boolean;
  };
}

const DEFAULT_LIMIT = 100;

export async function fetchWorkersList(
  filters: WorkerFilters = {}
): Promise<WorkerRecord[]> {
  const supabase = await createServiceRoleClient();
  let query = supabase
    .from("worker_profiles")
    .select("*")
    .order(filters.orderBy?.column || "created_at", {
      ascending: filters.orderBy?.ascending ?? false,
    })
    .limit(filters.limit ?? DEFAULT_LIMIT);

  if (filters.status) {
    query = query.eq("verification_status", filters.status);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Failed to fetch worker profiles", error);
    return [];
  }

  const profileMap = await fetchUserProfilesMap(
    supabase,
    data.map((worker) => worker.user_id)
  );

  return data.map((worker) => mapWorker(worker, profileMap));
}

export async function fetchWorkerById(
  id: string
): Promise<WorkerRecord | null> {
  const supabase = await createServiceRoleClient();
  const { data, error } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to load worker profile", error);
    return null;
  }

  const profileMap = await fetchUserProfilesMap(supabase, [data.user_id]);
  return mapWorker(data, profileMap);
}

function mapWorker(
  worker: WorkerProfileRow,
  profileMap: Record<string, UserProfileRow | undefined>
): WorkerRecord {
  const profile = profileMap[worker.user_id];
  const num = (value: number | string | null | undefined) =>
    value === null || value === undefined ? 0 : Number(value);

  return {
    id: worker.id,
    user_id: worker.user_id,
    name: worker.full_name || profile?.full_name || "Unknown worker",
    email: profile?.email || "",
    phone: worker.phone_number || profile?.phone_number || "",
    service_category: worker.service_type || "Not specified",
    status: worker.verification_status || WORKER_STATUS.PENDING,
    created_at: worker.created_at || new Date().toISOString(),
    avatar_url: worker.profile_picture_url,
    rating:
      worker.rating === null || worker.rating === undefined
        ? null
        : Number(worker.rating),
    total_jobs: worker.total_jobs ?? 0,
    total_earnings: num(worker.total_earnings),
    onboarding_completed: worker.onboarding_completed ?? false,
    national_id_url: worker.national_id_url,
    certification_url: worker.certification_url,
  };
}

async function fetchUserProfilesMap(
  supabase: Awaited<ReturnType<typeof createServiceRoleClient>>,
  userIds: string[]
) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .in("id", uniqueIds);

  if (error || !data) {
    console.error("Failed to fetch related user profiles", error);
    return {};
  }

  return data.reduce<Record<string, UserProfileRow>>((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});
}

