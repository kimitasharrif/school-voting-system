"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Trophy,
  Users,
  Vote,
} from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";

type Election = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "closed";
  show_results_publicly: boolean;
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

type TallyPosition = {
  id: string;
  title: string;
  description: string | null;
  totalVotes: number;
  candidates: CandidateResult[];
  winner: CandidateResult | null;
};

type TallyData = {
  election: Election;
  summary: {
    totalVoters: number;
    totalVotes: number;
    votersWhoVoted: number;
    turnout: number;
  };
  tally: TallyPosition[];
};

export default function AdminTallyPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [tallyData, setTallyData] = useState<TallyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const selectedElection = useMemo(
    () => elections.find((election) => election.id === selectedElectionId),
    [elections, selectedElectionId]
  );

  async function loadElections() {
    const response = await fetch("/api/admin/elections");
    const result = await response.json();

    const electionList: Election[] = result.elections ?? [];
    setElections(electionList);

    if (!selectedElectionId && electionList.length > 0) {
      const active =
        electionList.find((election) => election.status === "active") ??
        electionList[0];

      setSelectedElectionId(active.id);
    }
  }

  async function loadTally(electionId: string) {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/tally?electionId=${electionId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setTallyData(null);
        alert(result.message || "Failed to fetch tally.");
        return;
      }

      setTallyData({
        election: result.election,
        summary: result.summary,
        tally: result.tally ?? [],
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadElections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedElectionId) {
      loadTally(selectedElectionId);
    } else {
      setLoading(false);
    }
  }, [selectedElectionId]);

  async function toggleResultsPublication() {
    if (!selectedElection || !tallyData) return;

    setPublishing(true);

    try {
      const response = await fetch("/api/admin/elections", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedElection.id,
          showResultsPublicly: !selectedElection.show_results_publicly,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Failed to update results visibility.");
        return;
      }

      await loadElections();
      await loadTally(selectedElection.id);
    } finally {
      setPublishing(false);
    }
  }

  const stats = tallyData
    ? [
        {
          title: "Total Voters",
          value: tallyData.summary.totalVoters,
          icon: Users,
        },
        {
          title: "Votes Cast",
          value: tallyData.summary.totalVotes,
          icon: Vote,
        },
        {
          title: "Voted Students",
          value: tallyData.summary.votersWhoVoted,
          icon: CheckCircle2,
        },
        {
          title: "Turnout",
          value: `${tallyData.summary.turnout}%`,
          icon: BarChart3,
        },
      ]
    : [];

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">Tally</h1>

            <p className="mt-3 text-muted-foreground">
              View live vote counts, turnout and winners.
            </p>
          </div>

          <div className="w-full md:w-96">
            <label className="text-sm font-bold">Select Election</label>
            <select
              value={selectedElectionId}
              onChange={(event) => setSelectedElectionId(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Select election</option>
              {elections.map((election) => (
                <option key={election.id} value={election.id}>
                  {election.title} ({election.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedElection ? (
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-black">No election selected</h2>
            <p className="mt-2 text-muted-foreground">
              Create an election first from the Elections page.
            </p>
          </div>
        ) : loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !tallyData ? (
          <div className="rounded-3xl border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-black">No tally available</h2>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black">
                      {tallyData.election.title}
                    </h2>

                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase">
                      {tallyData.election.status}
                    </span>

                    {selectedElection.show_results_publicly ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Public
                      </span>
                    ) : (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                        Hidden
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-muted-foreground">
                    {tallyData.election.description || "No description"}
                  </p>
                </div>

                <button
                  onClick={toggleResultsPublication}
                  disabled={publishing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {publishing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : selectedElection.show_results_publicly ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}

                  {selectedElection.show_results_publicly
                    ? "Hide Results"
                    : "Publish Results"}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-3xl border bg-card p-6 shadow-sm"
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>

                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-black">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {tallyData.tally.length === 0 ? (
              <div className="rounded-3xl border bg-card p-8 text-muted-foreground shadow-sm">
                No positions found for this election.
              </div>
            ) : (
              <div className="space-y-6">
                {tallyData.tally.map((position) => (
                  <div
                    key={position.id}
                    className="rounded-3xl border bg-card p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <h3 className="text-xl font-black">
                          {position.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {position.description || "No description"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-muted px-4 py-3 text-sm font-bold">
                        {position.totalVotes} votes
                      </div>
                    </div>

                    {position.winner ? (
                      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                        <Trophy className="h-5 w-5" />
                        <p className="font-bold">
                          Current winner: {position.winner.name}
                        </p>
                      </div>
                    ) : null}

                    <div className="mt-5 space-y-3">
                      {position.candidates.length === 0 ? (
                        <p className="rounded-2xl border bg-muted/30 p-4 text-muted-foreground">
                          No candidates under this position.
                        </p>
                      ) : (
                        position.candidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="rounded-2xl border bg-background p-4"
                          >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                              <div>
                                <h4 className="font-black">
                                  {candidate.name}
                                </h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {candidate.class_name || "No class"} ·{" "}
                                  {candidate.slogan || "No slogan"}
                                </p>
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
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}