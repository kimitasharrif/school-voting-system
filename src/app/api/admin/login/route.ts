import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { fail } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {

      console.log("[Admin Login Debug]", {
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasAdminSessionSecret: Boolean(process.env.ADMIN_SESSION_SECRET),
      hasAdminSetupSecret: Boolean(process.env.ADMIN_SETUP_SECRET),
    });
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid login details.", 422, parsed.error.flatten());
  }

  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!sessionSecret) {
    return fail("Admin session secret is not configured.", 500);
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase.rpc("verify_admin_login", {
    p_email: parsed.data.email,
    p_password: parsed.data.password,
  });

  if (error) {
    return fail("Failed to verify admin login.", 500, error.message);
  }

  const admin = Array.isArray(data) ? data[0] : null;

  if (!admin) {
    return fail("Invalid admin email or password.", 401);
  }

  const response = NextResponse.json({
    success: true,
    message: "Login successful.",
    admin: {
      id: admin.admin_id,
      name: admin.admin_name,
      email: admin.admin_email,
      role: admin.admin_role,
    },
  });

  response.cookies.set("school_vote_admin_session", sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}