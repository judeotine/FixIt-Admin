import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { OTP_EXPIRY_MINUTES, MAX_OTP_REQUESTS_PER_HOUR } from "@/lib/constants";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = loginSchema.parse(body);

    const supabase = await createServiceRoleClient();
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("role", "admin")
      .eq("is_active", true)
      .single();

    if (adminError || !adminUser) {
      return NextResponse.json({
        success: true,
        message: "If an admin account exists with this email, an OTP has been sent.",
      });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: recentOTPs, error: otpCheckError } = await supabase
      .from("otp_codes")
      .select("id")
      .eq("admin_id", adminUser.id)
      .gte("created_at", oneHourAgo);

    const rateLimit = process.env.NODE_ENV === 'development' ? 10 : MAX_OTP_REQUESTS_PER_HOUR;
    
    if (recentOTPs && recentOTPs.length >= rateLimit) {
      return NextResponse.json(
        { 
          error: `Too many OTP requests (${recentOTPs.length}/${rateLimit}). Please try again in about an hour.`,
          retryAfter: 60
        },
        { status: 429 }
      );
    }

    const otp = randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        admin_id: adminUser.id,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        used: false,
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      throw new Error("Failed to generate OTP");
    }

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "FixIt UG Admin Login - Your OTP Code",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-box { background-color: white; border: 2px solid #4F46E5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
              .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; }
              .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 20px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>FixIt UG Admin Portal</h1>
              </div>
              <div class="content">
                <h2>Your Login Code</h2>
                <p>Hello ${adminUser.name},</p>
                <p>Use the following One-Time Password (OTP) to complete your login:</p>
                
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                
                <p><strong>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</strong></p>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Never share this code with anyone</li>
                    <li>FixIt UG staff will never ask for your OTP</li>
                    <li>If you didn't request this code, please ignore this email</li>
                  </ul>
                </div>
                
                <p>If you're having trouble logging in, please contact support.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} FixIt UG. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error("Failed to send OTP email");
    }

    await supabase.from("admin_audit_logs").insert({
      admin_id: adminUser.id,
      action: "OTP_REQUESTED",
      resource_type: "AUTH",
      ip_address: ipAddress,
      user_agent: request.headers.get("user-agent") || "unknown",
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
