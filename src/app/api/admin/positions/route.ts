import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createPositionSchema, updatePositionSchema } from "@/lib/validations";

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
    .from("positions")
    .select("*")
    .eq("election_id", electionId)
    .order("sort_order", { ascending: true });

  if (error) {
    return fail("Failed to fetch positions.", 500, error.message);
  }

  return ok({
    positions: data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const body = await request.json();
  const parsed = createPositionSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid position data.", 422, parsed.error.flatten());
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("positions")
    .insert({
      election_id: parsed.data.electionId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      sort_order: parsed.data.sortOrder,
    })
    .select("*")
    .single();

  if (error) {
    return fail("Failed to create position.", 500, error.message);
  }

  return ok(
    {
      position: data,
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
  const parsed = updatePositionSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid position update data.", 422, parsed.error.flatten());
  }

  const { id, ...values } = parsed.data;
  const supabase = createSupabaseAdmin();

  const updateData: Record<string, unknown> = {};

  if (values.electionId !== undefined) updateData.election_id = values.electionId;
  if (values.title !== undefined) updateData.title = values.title;
  if (values.description !== undefined) {
    updateData.description = values.description ?? null;
  }
  if (values.sortOrder !== undefined) updateData.sort_order = values.sortOrder;

  const { data, error } = await supabase
    .from("positions")
    .update(updateData)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return fail("Failed to update position.", 500, error.message);
  }

  return ok({
    position: data,
  });
}

export async function DELETE(request: NextRequest) {
  const admin = requireAdmin(request);

  if (!admin.ok) {
    return admin.response;
  }

  const positionId = request.nextUrl.searchParams.get("id");

  if (!positionId) {
    return fail("Position id is required.", 400);
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("positions").delete().eq("id", positionId);

  if (error) {
    return fail("Failed to delete position.", 500, error.message);
  }

  return ok({
    message: "Position deleted successfully.",
  });
}