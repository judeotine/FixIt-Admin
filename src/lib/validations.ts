import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const loginSchema = z.object({
  email: emailSchema,
});

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});

export const verifyWorkerSchema = z.object({
  workerId: z.string().uuid("Invalid worker ID"),
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

export const analyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).optional().default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const MAX_OTP_ATTEMPTS = 5;

