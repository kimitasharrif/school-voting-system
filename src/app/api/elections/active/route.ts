import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_request: NextRequest) {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("elections")
    .select("id, title, description, status, starts_at, ends_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return fail("Failed to fetch active election.", 500, error.message);
  }

  if (!data) {
    return fail("No active election is available right now.", 404);
  }

  const now = new Date();

  if (data.starts_at && new Date(data.starts_at) > now) {
    return fail("The active election has not started yet.", 403);
  }

  if (data.ends_at && new Date(data.ends_at) < now) {
    return fail("The active election has already ended.", 403);
  }

  return ok({
    election: data,
  });
}