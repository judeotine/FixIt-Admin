import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { loginSchema, otpSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { MAX_OTP_ATTEMPTS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const supabase = await createServiceRoleClient();
  
  try {
    const body = await request.json();
    console.log('Received OTP verification request for:', body.email);
    
    const { email } = loginSchema.parse({ email: body.email });
    const { otp } = otpSchema.parse({ otp: body.otp });

    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    console.log('Looking up admin user...');
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email)
      .eq("role", "admin")
      .eq("is_active", true)
      .single();

    if (adminError || !adminUser) {
      console.error('Admin user not found:', adminError);
      await supabase.from("login_attempts").insert({
        email,
        ip_address: ipAddress,
        success: false,
      });

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log('Admin user found:', adminUser.id);

    const now = new Date().toISOString();
    console.log('Looking up OTP record...');

    const { data: otpRecords, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("admin_id", adminUser.id)
      .eq("used", false)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1);

    if (otpError || !otpRecords || otpRecords.length === 0) {
      console.error('OTP not found or expired:', otpError);
      await supabase.from("login_attempts").insert({
        email,
        ip_address: ipAddress,
        success: false,
      });

      return NextResponse.json(
        { error: "OTP expired or invalid. Please request a new one." },
        { status: 401 }
      );
    }

    const otpRecord = otpRecords[0];
    console.log('OTP record found, attempts:', otpRecord.attempts);

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      console.log('Max attempts exceeded');
      await supabase
        .from("otp_codes")
        .update({ used: true })
        .eq("id", otpRecord.id);

      await supabase.from("login_attempts").insert({
        email,
        ip_address: ipAddress,
        success: false,
      });

      return NextResponse.json(
        { error: "Maximum attempts exceeded. Please request a new OTP." },
        { status: 429 }
      );
    }

    console.log('Verifying OTP...');
    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);

    if (!isValid) {
      console.log('Invalid OTP');
      const newAttempts = otpRecord.attempts + 1;
      const remainingAttempts = MAX_OTP_ATTEMPTS - newAttempts;

      await supabase
        .from("otp_codes")
        .update({ attempts: newAttempts })
        .eq("id", otpRecord.id);

      await supabase.from("login_attempts").insert({
        email,
        ip_address: ipAddress,
        success: false,
      });

      return NextResponse.json(
        {
          error: "Invalid OTP",
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0,
        },
        { status: 401 }
      );
    }

    console.log('OTP verified successfully');

    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    await supabase
      .from("admin_users")
      .update({ last_login: now })
      .eq("id", adminUser.id);

    await supabase.from("login_attempts").insert({
      email,
      ip_address: ipAddress,
      success: true,
    });

    await supabase.from("admin_audit_logs").insert({
      admin_id: adminUser.id,
      action: "LOGIN",
      resource_type: "AUTH",
      details: { method: "OTP" },
      ip_address: ipAddress,
      user_agent: request.headers.get("user-agent") || "unknown",
    });

    console.log('Creating session...');
    console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
    console.log('SESSION_SECRET length:', process.env.SESSION_SECRET?.length || 0);
    
    if (!process.env.SESSION_SECRET) {
      throw new Error('SESSION_SECRET is not set in environment variables');
    }
    
    if (process.env.SESSION_SECRET.length < 32) {
      throw new Error(`SESSION_SECRET must be at least 32 characters (current: ${process.env.SESSION_SECRET.length})`);
    }

    let sessionData;
    try {
      sessionData = await createSession({
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      });
    } catch (sessionError) {
      console.error('createSession threw an error:', sessionError);
      throw sessionError;
    }
    
    const { expiresAt, token, cookieName } = sessionData;

    console.log('Session created successfully');

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        avatarUrl: adminUser.avatar_url,
      },
      expiresAt: expiresAt.toISOString(),
    });

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    console.log('Response prepared with cookie');
    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Full error in verify-otp:", error);
    console.error("Error message:", errorMessage);
    console.error("Error stack:", errorStack);
    
    try {
      await supabase.from("admin_audit_logs").insert({
        admin_id: null,
        action: "LOGIN_ERROR",
        resource_type: "AUTH",
        details: { 
          error: errorMessage,
          stack: errorStack
        },
        ip_address: request.headers.get("x-forwarded-for") || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return NextResponse.json(
      { 
        error: "An error occurred during verification",
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          error: errorMessage,
          stack: errorStack,
          type: error instanceof Error ? error.constructor.name : typeof error
        } : undefined
      },
      { status: 500 }
    );
  }
}
