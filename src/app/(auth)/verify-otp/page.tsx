import { OTPForm } from "@/components/otp-form";
import Image from "next/image";

export default function VerifyOTPPage() {
  return (
    <div className="flex min-h-svh w-full">
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-xs">
          <OTPForm />
        </div>
      </div>
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/otp.gif"
          alt="Verify OTP"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
      </div>
    </div>
  );
}

