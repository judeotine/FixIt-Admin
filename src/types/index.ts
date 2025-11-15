export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string | null;
  created_at: string;
  last_login?: string | null;
  is_active: boolean;
}

export interface OTPCode {
  id: string;
  admin_id: string;
  otp_hash: string;
  expires_at: string;
  attempts: number;
  used: boolean;
  created_at: string;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_category: string;
  status: "pending" | "verified" | "suspended";
  rating?: number | null;
  total_jobs: number;
  total_earnings: number;
  date_joined: string;
  avatar_url?: string | null;
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_spent: number;
  total_bookings: number;
  date_joined: string;
  avatar_url?: string | null;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  date_time: string;
  recruiter_id: string;
  worker_id: string;
  service_id: string;
  amount: number;
  platform_fee: number;
  worker_payout: number;
  status: "pending" | "completed" | "refunded" | "disputed";
  payment_method: string;
}

export interface Dispute {
  id: string;
  dispute_id: string;
  date_raised: string;
  recruiter_id: string;
  worker_id: string;
  service_id: string;
  amount: number;
  status: "open" | "under_review" | "resolved" | "closed";
  description: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  base_price: number;
  is_active: boolean;
}

export interface DashboardStats {
  totalActiveWorkers: number;
  totalRecruiters: number;
  todayTransactions: {
    count: number;
    value: number;
  };
  pendingVerifications: number;
  monthlyRevenue: number;
  platformCommission: number;
  averageRating: number;
  activeBookings: number;
}

export interface AnalyticsData {
  revenue: {
    date: string;
    amount: number;
  }[];
  serviceDistribution: {
    category: string;
    count: number;
    value: number;
  }[];
  topWorkers: {
    id: string;
    name: string;
    earnings: number;
  }[];
  userGrowth: {
    date: string;
    workers: number;
    recruiters: number;
  }[];
}

