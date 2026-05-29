import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createVoterSchema, updateVoterSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const electionId = request.nextUrl.searchParams.get("electionId");

  if (!electionId) {
    return fail("Election id is required.", 400);
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("voters")
    .select("id, election_id, full_name, admission_number, class_name, voter_code, is_active, created_at")
    .eq("election_id", electionId)
    .order("created_at", { ascending: false });

  if (error) {
    return fail("Failed to fetch voters.", 500, error.message);
  }

  return ok({
    voters: data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json();
  const parsed = createVoterSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid voter data.", 422, parsed.error.flatten());
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("voters")
    .insert({
      election_id: parsed.data.electionId,
      full_name: parsed.data.fullName,
      admission_number: parsed.data.admissionNumber,
      class_name: parsed.data.className ?? null,
      voter_code: parsed.data.voterCode,
      is_active: parsed.data.isActive,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return fail(
        "A voter with this admission number or voter code already exists for this election.",
        409
      );
    }

    return fail("Failed to create voter.", 500, error.message);
  }

  return ok(
    {
      voter: data,
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
  const parsed = updateVoterSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid voter update data.", 422, parsed.error.flatten());
  }

  const { id, ...values } = parsed.data;
  const supabase = createSupabaseAdmin();

  const updateData: Record<string, unknown> = {};

  if (values.electionId !== undefined) updateData.election_id = values.electionId;
  if (values.fullName !== undefined) updateData.full_name = values.fullName;
  if (values.admissionNumber !== undefined) {
    updateData.admission_number = values.admissionNumber;
  }
  if (values.className !== undefined) updateData.class_name = values.className;
  if (values.voterCode !== undefined) updateData.voter_code = values.voterCode;
  if (values.isActive !== undefined) updateData.is_active = values.isActive;

  const { data, error } = await supabase
    .from("voters")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return fail(
        "A voter with this admission number or voter code already exists for this election.",
        409
      );
    }

    return fail("Failed to update voter.", 500, error.message);
  }

  return ok({
    voter: data,
  });
}

export async function DELETE(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const voterId = request.nextUrl.searchParams.get("id");

  if (!voterId) {
    return fail("Voter id is required.", 400);
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("voters").delete().eq("id", voterId);

  if (error) {
    return fail("Failed to delete voter.", 500, error.message);
  }

  return ok({
    message: "Voter deleted successfully.",
  });
}