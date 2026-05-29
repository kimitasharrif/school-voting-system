"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Loader2,
  Trophy,
  Vote,
} from "lucide-react";

type Election = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "closed";
};

type CandidateResult = {
  id: string;
  position_id: string;
  name: string;
  class_name: string | null;
  photo_url: string | null;
  slogan: string | null;
  votes: number;
  percentage: number;
};

type PositionResult = {
  id: string;
  title: string;
  description: string | null;
  totalVotes: number;
  candidates: CandidateResult[];
  winner: CandidateResult | null;
};

type ResultsResponse = {
  success: boolean;
  message?: string;
  election?: Election;
  results?: PositionResult[];
};

export default function ResultsPage() {
  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<PositionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadResults() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/results", {
        cache: "no-store",
      });

      const result: ResultsResponse = await response.json();

      if (!response.ok || !result.success) {
        setElection(null);
        setResults([]);
        setMessage(result.message || "No published results yet.");
        return;
      }

      setElection(result.election ?? null);
      setResults(result.results ?? []);
    } catch {
      setMessage("Failed to load published results.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  const totalVotes = results.reduce(
    (sum, position) => sum + position.totalVotes,
    0
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BarChart3 className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-black tracking-tight">
            Election Results
          </h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Published election results will appear here after the admin makes
            them public.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center rounded-3xl border bg-card shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : message ? (
          <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-black">No Published Results</h2>

            <p className="mt-2 font-medium text-muted-foreground">{message}</p>
          </div>
        ) : !election ? (
          <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">
            <p className="font-semibold text-muted-foreground">
              No published results yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black">{election.title}</h2>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Published
                    </span>

                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase text-muted-foreground">
                      {election.status}
                    </span>
                  </div>

                  <p className="mt-2 text-muted-foreground">
                    {election.description || "Election results are now public."}
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/30 px-5 py-4 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Votes
                  </p>
                  <p className="mt-1 text-3xl font-black">{totalVotes}</p>
                </div>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">
                <p className="font-semibold text-muted-foreground">
                  No results available for this election.
                </p>
              </div>
            ) : (
              results.map((position) => (
                <div
                  key={position.id}
                  className="rounded-3xl border bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div>
                      <h3 className="text-xl font-black">{position.title}</h3>

                      <p className="mt-2 text-muted-foreground">
                        {position.description || "Final vote tally"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-muted px-4 py-3 text-sm font-bold">
                      {position.totalVotes} votes
                    </div>
                  </div>

                  {position.winner && position.totalVotes > 0 ? (
                    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                      <Trophy className="h-5 w-5" />
                      <p className="font-bold">
                        Winner: {position.winner.name}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-6 space-y-3">
                    {position.candidates.length === 0 ? (
                      <div className="rounded-2xl border bg-muted/30 p-4 text-muted-foreground">
                        No candidates found for this position.
                      </div>
                    ) : (
                      position.candidates.map((candidate, index) => {
                        const isWinner =
                          position.totalVotes > 0 &&
                          position.winner?.id === candidate.id;

                        return (
                          <div
                            key={candidate.id}
                            className={`rounded-2xl border p-4 ${
                              isWinner
                                ? "border-yellow-200 bg-yellow-50/70"
                                : "bg-background"
                            }`}
                          >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                              <div className="flex items-center gap-4">
                                <div
                                  className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black ${
                                    isWinner
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {index + 1}
                                </div>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-black">
                                      {candidate.name}
                                    </h4>

                                    {isWinner ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                                        <Trophy className="h-3 w-3" />
                                        Winner
                                      </span>
                                    ) : null}
                                  </div>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {candidate.class_name || "No class"}{" "}
                                    {candidate.slogan
                                      ? `· ${candidate.slogan}`
                                      : ""}
                                  </p>
                                </div>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-2xl font-black">
                                  {candidate.votes}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {candidate.percentage}%
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${candidate.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))
            )}

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-bold">Results are officially published.</p>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                These results are visible because the admin has enabled public
                results for this election.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}