import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { submitVoteSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = submitVoteSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid vote data.", 422, parsed.error.flatten());
  }

  const { electionId, voterCode, votes } = parsed.data;
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
    return fail("Voting is not currently active.", 403);
  }

  const now = new Date();

  if (election.starts_at && new Date(election.starts_at) > now) {
    return fail("This election has not started yet.", 403);
  }

  if (election.ends_at && new Date(election.ends_at) < now) {
    return fail("This election has already ended.", 403);
  }

  const positionIds = votes.map((vote) => vote.positionId);
  const uniquePositionIds = new Set(positionIds);

  if (uniquePositionIds.size !== positionIds.length) {
    return fail("You cannot submit multiple votes for the same position.", 400);
  }

  const { data: voter, error: voterError } = await supabase
    .from("voters")
    .select("id, full_name, admission_number, class_name, is_active")
    .eq("election_id", electionId)
    .eq("voter_code", voterCode.trim())
    .single();

  if (voterError || !voter) {
    return fail("Invalid voter code.", 401);
  }

  if (!voter.is_active) {
    return fail("This voter account is disabled.", 403);
  }

  const { data: validPositions, error: positionsError } = await supabase
    .from("positions")
    .select("id")
    .eq("election_id", electionId)
    .in("id", positionIds);

  if (positionsError) {
    return fail("Failed to validate positions.", 500, positionsError.message);
  }

  if ((validPositions ?? []).length !== positionIds.length) {
    return fail("One or more positions are invalid.", 400);
  }

  const candidateIds = votes.map((vote) => vote.candidateId);

  const { data: validCandidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, position_id")
    .eq("election_id", electionId)
    .eq("is_active", true)
    .in("id", candidateIds);

  if (candidatesError) {
    return fail("Failed to validate candidates.", 500, candidatesError.message);
  }

  if ((validCandidates ?? []).length !== candidateIds.length) {
    return fail("One or more candidates are invalid.", 400);
  }

  for (const vote of votes) {
    const candidate = validCandidates?.find(
      (item) => item.id === vote.candidateId
    );

    if (!candidate || candidate.position_id !== vote.positionId) {
      return fail(
        "A selected candidate does not belong to the chosen position.",
        400
      );
    }
  }

  const { data: existingVotes, error: existingVotesError } = await supabase
    .from("votes")
    .select("position_id")
    .eq("election_id", electionId)
    .eq("voter_id", voter.id)
    .in("position_id", positionIds);

  if (existingVotesError) {
    return fail(
      "Failed to check previous votes.",
      500,
      existingVotesError.message
    );
  }

  if (existingVotes && existingVotes.length > 0) {
    return fail("You have already voted for one or more selected positions.", 409);
  }

  const voteRows = votes.map((vote) => ({
    election_id: electionId,
    position_id: vote.positionId,
    candidate_id: vote.candidateId,
    voter_id: voter.id,
  }));

  const { error: insertError } = await supabase.from("votes").insert(voteRows);

  if (insertError) {
    if (insertError.code === "23505") {
      return fail("Duplicate vote rejected. You cannot vote twice.", 409);
    }

    return fail("Failed to submit vote.", 500, insertError.message);
  }

  return ok(
    {
      message: "Vote submitted successfully.",
    },
    201
  );
}