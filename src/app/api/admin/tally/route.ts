import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

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

  const { data: election, error: electionError } = await supabase
    .from("elections")
    .select("*")
    .eq("id", electionId)
    .single();

  if (electionError || !election) {
    return fail("Election not found.", 404);
  }

  const { count: totalVoters, error: votersError } = await supabase
    .from("voters")
    .select("*", { count: "exact", head: true })
    .eq("election_id", electionId);

  if (votersError) {
    return fail("Failed to count voters.", 500, votersError.message);
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
    .select("id, position_id, name, class_name, photo_url, slogan")
    .eq("election_id", electionId)
    .order("sort_order", { ascending: true });

  if (candidatesError) {
    return fail("Failed to fetch candidates.", 500, candidatesError.message);
  }

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("position_id, candidate_id, voter_id, created_at")
    .eq("election_id", electionId);

  if (votesError) {
    return fail("Failed to fetch votes.", 500, votesError.message);
  }

  const uniqueVotersWhoVoted = new Set(
    (votes ?? []).map((vote) => vote.voter_id)
  );

  const tally =
    positions?.map((position) => {
      const positionCandidates =
        candidates?.filter((candidate) => candidate.position_id === position.id) ??
        [];

      const positionVotes =
        votes?.filter((vote) => vote.position_id === position.id) ?? [];

      const totalPositionVotes = positionVotes.length;

      const candidateResults = positionCandidates.map((candidate) => {
        const voteCount = positionVotes.filter(
          (vote) => vote.candidate_id === candidate.id
        ).length;

        return {
          ...candidate,
          votes: voteCount,
          percentage:
            totalPositionVotes === 0
              ? 0
              : Math.round((voteCount / totalPositionVotes) * 100),
        };
      });

      const sortedCandidates = candidateResults.sort(
        (a, b) => b.votes - a.votes
      );

      return {
        ...position,
        totalVotes: totalPositionVotes,
        candidates: sortedCandidates,
        winner: sortedCandidates[0] ?? null,
      };
    }) ?? [];

  const turnout =
    totalVoters && totalVoters > 0
      ? Math.round((uniqueVotersWhoVoted.size / totalVoters) * 100)
      : 0;

  return ok({
    election,
    summary: {
      totalVoters: totalVoters ?? 0,
      totalVotes: votes?.length ?? 0,
      votersWhoVoted: uniqueVotersWhoVoted.size,
      turnout,
    },
    tally,
  });
}