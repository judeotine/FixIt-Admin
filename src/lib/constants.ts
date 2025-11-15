export const APP_NAME = "FixIt UG Admin";
export const APP_DESCRIPTION = "Admin Dashboard for FixIt UG Platform";

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_LENGTH = 6;
export const MAX_OTP_ATTEMPTS = 5;
export const MAX_OTP_REQUESTS_PER_HOUR = 3;
export const SESSION_TIMEOUT_MINUTES = 30;
export const RESEND_OTP_COOLDOWN_SECONDS = 60;

export const ADMIN_ROLE = "admin";

export const WORKER_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  SUSPENDED: "suspended",
} as const;

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
} as const;

export const DISPUTE_STATUS = {
  OPEN: "open",
  UNDER_REVIEW: "under_review",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "Workers", href: "/dashboard/workers", icon: "Users" },
  { name: "Pending Verification", href: "/dashboard/workers/pending-verification", icon: "UserCheck" },
  { name: "Recruiters", href: "/dashboard/recruiters", icon: "Briefcase" },
  { name: "Services", href: "/dashboard/services", icon: "Wrench" },
  { name: "Transactions", href: "/dashboard/transactions", icon: "DollarSign" },
  { name: "Disputes", href: "/dashboard/disputes", icon: "AlertTriangle" },
  { name: "Analytics", href: "/dashboard/analytics", icon: "BarChart" },
] as const;

