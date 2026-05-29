import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const electionId = request.nextUrl.searchParams.get("electionId");
  const supabase = createSupabaseAdmin();

  let electionQuery = supabase
    .from("elections")
    .select("*")
    .eq("show_results_publicly", true);

  if (electionId) {
    electionQuery = electionQuery.eq("id", electionId);
  } else {
    electionQuery = electionQuery.order("created_at", { ascending: false }).limit(1);
  }

  const { data: electionData, error: electionError } = await electionQuery;

  const election = Array.isArray(electionData) ? electionData[0] : null;

  if (electionError || !election) {
    return fail("Results are not published yet.", 403);
  }

  const { data: positions, error: positionsError } = await supabase
    .from("positions")
    .select("id, title, description, sort_order")
    .eq("election_id", election.id)
    .order("sort_order", { ascending: true });

  if (positionsError) {
    return fail("Failed to fetch positions.", 500, positionsError.message);
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from("candidates")
    .select("id, position_id, name, class_name, photo_url, slogan")
    .eq("election_id", election.id)
    .order("sort_order", { ascending: true });

  if (candidatesError) {
    return fail("Failed to fetch candidates.", 500, candidatesError.message);
  }

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("position_id, candidate_id")
    .eq("election_id", election.id);

  if (votesError) {
    return fail("Failed to fetch votes.", 500, votesError.message);
  }

  const results =
    positions?.map((position) => {
      const positionCandidates =
        candidates?.filter((candidate) => candidate.position_id === position.id) ??
        [];

      const positionVotes =
        votes?.filter((vote) => vote.position_id === position.id) ?? [];

      const totalVotes = positionVotes.length;

      const candidateResults = positionCandidates.map((candidate) => {
        const voteCount = positionVotes.filter(
          (vote) => vote.candidate_id === candidate.id
        ).length;

        return {
          ...candidate,
          votes: voteCount,
          percentage:
            totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100),
        };
      });

      const sortedCandidates = candidateResults.sort(
        (a, b) => b.votes - a.votes
      );

      return {
        ...position,
        totalVotes,
        candidates: sortedCandidates,
        winner: sortedCandidates[0] ?? null,
      };
    }) ?? [];

  return ok({
    election: {
      id: election.id,
      title: election.title,
      description: election.description,
      status: election.status,
    },
    results,
  });
}