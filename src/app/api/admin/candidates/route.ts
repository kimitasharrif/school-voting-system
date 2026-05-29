import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  createCandidateSchema,
  updateCandidateSchema,
} from "@/lib/validations";

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
    .from("candidates")
    .select("*")
    .eq("election_id", electionId)
    .order("sort_order", { ascending: true });

  if (error) {
    return fail("Failed to fetch candidates.", 500, error.message);
  }

  return ok({
    candidates: data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json();
  const parsed = createCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid candidate data.", 422, parsed.error.flatten());
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("candidates")
    .insert({
      election_id: parsed.data.electionId,
      position_id: parsed.data.positionId,
      name: parsed.data.name,
      class_name: parsed.data.className ?? null,
      photo_url: parsed.data.photoUrl ?? null,
      slogan: parsed.data.slogan ?? null,
      manifesto: parsed.data.manifesto ?? null,
      is_active: parsed.data.isActive,
      sort_order: parsed.data.sortOrder,
    })
    .select("*")
    .single();

  if (error) {
    return fail("Failed to create candidate.", 500, error.message);
  }

  return ok(
    {
      candidate: data,
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
  const parsed = updateCandidateSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid candidate update data.", 422, parsed.error.flatten());
  }

  const { id, ...values } = parsed.data;
  const supabase = createSupabaseAdmin();

  const updateData: Record<string, unknown> = {};

  if (values.electionId !== undefined) updateData.election_id = values.electionId;
  if (values.positionId !== undefined) updateData.position_id = values.positionId;
  if (values.name !== undefined) updateData.name = values.name;
  if (values.className !== undefined) updateData.class_name = values.className;
  if (values.photoUrl !== undefined) updateData.photo_url = values.photoUrl;
  if (values.slogan !== undefined) updateData.slogan = values.slogan;
  if (values.manifesto !== undefined) updateData.manifesto = values.manifesto;
  if (values.isActive !== undefined) updateData.is_active = values.isActive;
  if (values.sortOrder !== undefined) updateData.sort_order = values.sortOrder;

  const { data, error } = await supabase
    .from("candidates")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fail("Failed to update candidate.", 500, error.message);
  }

  return ok({
    candidate: data,
  });
}

export async function DELETE(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const candidateId = request.nextUrl.searchParams.get("id");

  if (!candidateId) {
    return fail("Candidate id is required.", 400);
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("id", candidateId);

  if (error) {
    return fail("Failed to delete candidate.", 500, error.message);
  }

  return ok({
    message: "Candidate deleted successfully.",
  });
}