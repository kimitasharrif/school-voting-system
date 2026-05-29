import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyVoterSchema } from "@/lib/validations";

async function findVoterByIdentifier(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  electionId: string,
  identifier: string
) {
  const cleaned = identifier.trim().toUpperCase();

  const { data: voterByCode, error: codeError } = await supabase
    .from("voters")
    .select("id, full_name, admission_number, class_name, is_active")
    .eq("election_id", electionId)
    .eq("voter_code", cleaned)
    .maybeSingle();

  if (codeError) {
    throw codeError;
  }

  if (voterByCode) {
    return voterByCode;
  }

  const { data: voterByAdmission, error: admissionError } = await supabase
    .from("voters")
    .select("id, full_name, admission_number, class_name, is_active")
    .eq("election_id", electionId)
    .eq("admission_number", cleaned)
    .maybeSingle();

  if (admissionError) {
    throw admissionError;
  }

  return voterByAdmission;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = verifyVoterSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid voter verification data.", 422, parsed.error.flatten());
  }

  const { electionId } = parsed.data;

  const identifier =
    parsed.data.identifier ??
    parsed.data.voterCode ??
    parsed.data.admissionNumber ??
    "";

  const supabase = createSupabaseAdmin();

  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("*")
    .eq("id", electionId)
    .single();

  if (electionError || !election) {
    return fail("Election not found.", 404);
  }

  if (election.status !== "active") {
    return fail("This election is not active.", 403);
  }

  const now = new Date();

  if (election.starts_at && new Date(election.starts_at) > now) {
    return fail("This election has not started yet.", 403);
  }

  if (election.ends_at && new Date(election.ends_at) < now) {
    return fail("This election has already ended.", 403);
  }

  let voter;

  try {
    voter = await findVoterByIdentifier(supabase, electionId, identifier);
  } catch (error) {
    return fail(
      "Failed to verify voter.",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  if (!voter) {
    return fail("Invalid admission number or voter code.", 401);
  }

  if (!voter.is_active) {
    return fail("This voter account is disabled.", 403);
  }

  const { data: positions, error: positionsError } = await supabase
    .from("positions")
    .select("id, title, description, sort_order")
    .eq("election_id", electionId)
    .order("sort_order", { ascending: true });

  if (positionsError) {
    return fail("Failed to fetch positions.", 500, positionsError.message);
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select(
      "id, election_id, position_id, name, class_name, photo_url, slogan, manifesto, sort_order"
    )
    .eq("election_id", electionId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (candidatesError) {
    return fail("Failed to fetch candidates.", 500, candidatesError.message);
  }

  const { data: existingVotes, error: votesError } = await supabase
    .from("votes")
    .select("position_id")
    .eq("election_id", electionId)
    .eq("voter_id", voter.id);

  if (votesError) {
    return fail("Failed to check existing votes.", 500, votesError.message);
  }

  const votedPositionIds = new Set(
    (existingVotes ?? []).map((vote) => vote.position_id)
  );

  const positionsWithCandidates =
    positions?.map((position) => ({
      ...position,
      alreadyVoted: votedPositionIds.has(position.id),
      candidates:
        candidates?.filter(
          (candidate) => candidate.position_id === position.id
        ) ?? [],
    })) ?? [];

  return ok({
    election: {
      id: election.id,
      title: election.title,
      description: election.description,
      status: election.status,
    },
    voter,
    positions: positionsWithCandidates,
  });
}