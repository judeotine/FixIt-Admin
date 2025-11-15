"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { otpSchema } from "@/lib/validations";
import { RESEND_OTP_COOLDOWN_SECONDS, OTP_EXPIRY_MINUTES, MAX_OTP_ATTEMPTS } from "@/lib/constants";

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(OTP_EXPIRY_MINUTES * 60);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_OTP_ATTEMPTS);
  const router = useRouter();
  const emailRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      emailRef.current = sessionStorage.getItem("adminEmail");
      if (!emailRef.current) {
        router.push("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError("");
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue || otp;
    setError("");
    setLoading(true);

    try {
      const validatedOtp = otpSchema.parse({ otp: code });
      
      if (!emailRef.current) {
        throw new Error("Email not found. Please start over.");
      }

      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailRef.current,
          otp: validatedOtp.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        console.error("OTP verification error:", data);
        throw new Error(data.message || data.error || data.details?.error || "Invalid verification code");
      }

      sessionStorage.removeItem("adminEmail");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !emailRef.current) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailRef.current }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setResendCooldown(RESEND_OTP_COOLDOWN_SECONDS);
      setTimeRemaining(OTP_EXPIRY_MINUTES * 60);
      setOtp("");
      setError("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Enter verification code</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We sent a 6-digit code to your email.
            </p>
            {timeRemaining > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Code expires in {formatTime(timeRemaining)}
              </p>
            )}
            {timeRemaining === 0 && (
              <p className="text-sm text-destructive mt-2">
                Code has expired. Please request a new one.
              </p>
            )}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {attemptsRemaining < MAX_OTP_ATTEMPTS && (
            <Alert>
              <AlertDescription>
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining
              </AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification code
            </FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              value={otp}
              onChange={handleOtpChange}
              disabled={loading || timeRemaining === 0}
              required
            >
              <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription className="text-center">
              Enter the 6-digit code sent to your email.
            </FieldDescription>
          </Field>
          <Button type="submit" disabled={loading || otp.length !== 6 || timeRemaining === 0}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <FieldDescription className="text-center">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              className="underline underline-offset-4 hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
            </button>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
