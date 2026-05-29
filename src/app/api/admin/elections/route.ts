import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createElectionSchema, updateElectionSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("elections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return fail("Failed to fetch elections.", 500, error.message);
  }

  return ok({
    elections: data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json();
  const parsed = createElectionSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid election data.", 422, parsed.error.flatten());
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("elections")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      starts_at: parsed.data.startsAt ?? null,
      ends_at: parsed.data.endsAt ?? null,
      show_results_publicly: parsed.data.showResultsPublicly,
    })
    .select("*")
    .single();

  if (error) {
    return fail("Failed to create election.", 500, error.message);
  }

  await supabase.from("audit_logs").insert({
    action: "CREATE_ELECTION",
    description: `Created election: ${parsed.data.title}`,
  });

  return ok(
    {
      election: data,
    },
    201
  );
}

export async function PATCH(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json();
  const parsed = updateElectionSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid election update data.", 422, parsed.error.flatten());
  }

  const { id, ...values } = parsed.data;
  const supabase = createSupabaseAdmin();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (values.title !== undefined) updateData.title = values.title;
  if (values.description !== undefined) {
    updateData.description = values.description ?? null;
  }
  if (values.status !== undefined) updateData.status = values.status;
  if (values.startsAt !== undefined) updateData.starts_at = values.startsAt;
  if (values.endsAt !== undefined) updateData.ends_at = values.endsAt;
  if (values.showResultsPublicly !== undefined) {
    updateData.show_results_publicly = values.showResultsPublicly;
  }

  const { data, error } = await supabase
    .from("elections")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fail("Failed to update election.", 500, error.message);
  }

  return ok({
    election: data,
  });
}

export async function DELETE(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const electionId = request.nextUrl.searchParams.get("id");

  if (!electionId) {
    return fail("Election id is required.", 400);
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("elections").delete().eq("id", electionId);

  if (error) {
    return fail("Failed to delete election.", 500, error.message);
  }

  return ok({
    message: "Election deleted successfully.",
  });
}