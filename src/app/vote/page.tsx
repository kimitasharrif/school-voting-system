"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserCheck,
  Vote,
} from "lucide-react";

type Election = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "closed";
};

type Voter = {
  id: string;
  full_name: string;
  admission_number: string;
  class_name: string | null;
  is_active: boolean;
};

type Candidate = {
  id: string;
  election_id: string;
  position_id: string;
  name: string;
  class_name: string | null;
  photo_url: string | null;
  slogan: string | null;
  manifesto: string | null;
  sort_order: number;
};

type VotingPosition = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  alreadyVoted: boolean;
  candidates: Candidate[];
};

type VerifyResponse = {
  success: boolean;
  message?: string;
  election?: Election;
  voter?: Voter;
  positions?: VotingPosition[];
};

type ActiveElectionResponse = {
  success: boolean;
  message?: string;
  election?: Election;
};

export default function VotePage() {
  const [activeElection, setActiveElection] = useState<Election | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [voter, setVoter] = useState<Voter | null>(null);
  const [positions, setPositions] = useState<VotingPosition[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [loadingElection, setLoadingElection] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const votablePositions = useMemo(
    () => positions.filter((position) => !position.alreadyVoted),
    [positions]
  );

  const completedSelections = useMemo(
    () =>
      votablePositions.filter((position) => selectedVotes[position.id]).length,
    [selectedVotes, votablePositions]
  );

  const canSubmit =
    votablePositions.length > 0 &&
    completedSelections === votablePositions.length &&
    !submitting;

  async function loadActiveElection() {
    setLoadingElection(true);
    setError("");

    try {
      const response = await fetch("/api/elections/active");
      const result: ActiveElectionResponse = await response.json();

      if (!response.ok || !result.success || !result.election) {
        setError(result.message || "No active election is available right now.");
        return;
      }

      setActiveElection(result.election);
    } catch {
      setError("Failed to load active election.");
    } finally {
      setLoadingElection(false);
    }
  }

  useEffect(() => {
    loadActiveElection();
  }, []);

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeElection) {
      setError("No active election is available right now.");
      return;
    }

    if (!identifier.trim()) {
      setError("Enter your admission number or voter code.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setVerifying(true);

    try {
      const response = await fetch("/api/voters/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          electionId: activeElection.id,
          identifier: identifier.trim(),
        }),
      });

      const result: VerifyResponse = await response.json();

      if (!response.ok || !result.success || !result.voter || !result.positions) {
        setError(result.message || "Could not verify voter.");
        return;
      }

      setVoter(result.voter);
      setPositions(result.positions);
      setSelectedVotes({});
    } catch {
      setError("Something went wrong while verifying your details.");
    } finally {
      setVerifying(false);
    }
  }

  function selectCandidate(positionId: string, candidateId: string) {
    setSelectedVotes((prev) => ({
      ...prev,
      [positionId]: candidateId,
    }));
  }

  async function handleSubmitVote() {
    if (!activeElection || !voter) {
      setError("Verify your admission number or voter code first.");
      return;
    }

    const votes = votablePositions.map((position) => ({
      positionId: position.id,
      candidateId: selectedVotes[position.id],
    }));

    const missingVote = votes.some((vote) => !vote.candidateId);

    if (missingVote) {
      setError("Please select one candidate for every position.");
      return;
    }

    const confirmed = confirm(
      "Submit your vote now? After submitting, you cannot vote again for these positions."
    );

    if (!confirmed) return;

    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          electionId: activeElection.id,
          identifier: identifier.trim(),
          votes,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Failed to submit vote.");
        return;
      }

      setSuccessMessage("Your vote has been submitted successfully.");
      setSelectedVotes({});

      const verifyAgain = await fetch("/api/voters/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          electionId: activeElection.id,
          identifier: identifier.trim(),
        }),
      });

      const verifyResult: VerifyResponse = await verifyAgain.json();

      if (verifyResult.success && verifyResult.positions) {
        setPositions(verifyResult.positions);
      }
    } catch {
      setError("Something went wrong while submitting your vote.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetVotingSession() {
    setIdentifier("");
    setVoter(null);
    setPositions([]);
    setSelectedVotes({});
    setError("");
    setSuccessMessage("");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border bg-card p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Vote className="h-7 w-7" />
            </div>

            <h1 className="text-3xl font-black tracking-tight">
              Student Voting
            </h1>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Enter your admission number or voter code to view candidates and
              cast your vote securely.
            </p>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-4 text-sm">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              One student, one vote
            </div>
            <p className="mt-1 text-muted-foreground">
              Duplicate votes are blocked automatically.
            </p>
          </div>
        </div>

        {loadingElection ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error && !activeElection ? (
          <AlertBox message={error} />
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wider text-primary">
                Active Election
              </p>

              <h2 className="mt-2 text-2xl font-black">
                {activeElection?.title}
              </h2>

              <p className="mt-2 text-muted-foreground">
                {activeElection?.description || "No description provided."}
              </p>
            </div>

            {!voter ? (
              <form
                onSubmit={handleVerify}
                className="rounded-3xl border bg-card p-6 shadow-sm"
              >
                <h2 className="text-xl font-black">Verify Voter</h2>

                <p className="mt-2 text-muted-foreground">
                  Use either your admission number or your voter code.
                </p>

                {error ? <AlertBox message={error} /> : null}

                <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
                  <input
                    value={identifier}
                    onChange={(event) =>
                      setIdentifier(event.target.value.toUpperCase())
                    }
                    placeholder="Enter admission number or voter code"
                    className="h-12 rounded-2xl border bg-background px-4 outline-none transition focus:ring-4 focus:ring-primary/10"
                  />

                  <button
                    type="submit"
                    disabled={verifying}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                  >
                    {verifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                    Continue
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl border bg-card p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-primary">
                        Verified Voter
                      </p>

                      <h2 className="mt-2 text-2xl font-black">
                        {voter.full_name}
                      </h2>

                      <p className="mt-1 text-muted-foreground">
                        {voter.admission_number} ·{" "}
                        {voter.class_name || "No class"}
                      </p>
                    </div>

                    <button
                      onClick={resetVotingSession}
                      className="rounded-2xl border px-5 py-3 text-sm font-bold transition hover:bg-muted"
                    >
                      Change Voter
                    </button>
                  </div>
                </div>

                {successMessage ? (
                  <div className="flex items-center gap-3 rounded-3xl border border-green-200 bg-green-50 p-5 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-bold">{successMessage}</p>
                  </div>
                ) : null}

                {error ? <AlertBox message={error} /> : null}

                {positions.length === 0 ? (
                  <div className="rounded-3xl border bg-card p-6 text-muted-foreground shadow-sm">
                    No positions available for voting.
                  </div>
                ) : votablePositions.length === 0 ? (
                  <div className="rounded-3xl border bg-card p-8 text-center shadow-sm">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
                    <h2 className="mt-4 text-2xl font-black">
                      You have already voted
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      Your vote has already been recorded for all available
                      positions.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-3xl border bg-card p-6 shadow-sm">
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                          <h2 className="text-xl font-black">
                            Select Candidates
                          </h2>
                          <p className="mt-1 text-muted-foreground">
                            Choose one candidate for each position.
                          </p>
                        </div>

                        <div className="rounded-full bg-muted px-4 py-2 text-sm font-bold">
                          {completedSelections}/{votablePositions.length}{" "}
                          selected
                        </div>
                      </div>
                    </div>

                    {positions.map((position) => {
                      if (position.alreadyVoted) {
                        return (
                          <div
                            key={position.id}
                            className="rounded-3xl border bg-card p-6 shadow-sm"
                          >
                            <h3 className="text-xl font-black">
                              {position.title}
                            </h3>

                            <p className="mt-2 text-muted-foreground">
                              You have already voted for this position.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={position.id}
                          className="rounded-3xl border bg-card p-6 shadow-sm"
                        >
                          <div className="mb-5">
                            <h3 className="text-xl font-black">
                              {position.title}
                            </h3>

                            <p className="mt-2 text-muted-foreground">
                              {position.description || "Select one candidate."}
                            </p>
                          </div>

                          {position.candidates.length === 0 ? (
                            <div className="rounded-2xl border bg-muted/30 p-4 text-muted-foreground">
                              No candidates under this position.
                            </div>
                          ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                              {position.candidates.map((candidate) => {
                                const selected =
                                  selectedVotes[position.id] === candidate.id;

                                return (
                                  <button
                                    key={candidate.id}
                                    type="button"
                                    onClick={() =>
                                      selectCandidate(position.id, candidate.id)
                                    }
                                    className={`rounded-3xl border p-5 text-left transition ${
                                      selected
                                        ? "border-primary bg-primary/10 ring-4 ring-primary/10"
                                        : "bg-background hover:bg-muted/40"
                                    }`}
                                  >
                                    <div className="flex gap-4">
                                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-lg font-black">
                                        {candidate.photo_url ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={candidate.photo_url}
                                            alt={candidate.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          candidate.name.charAt(0)
                                        )}
                                      </div>

                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-black">
                                            {candidate.name}
                                          </h4>

                                          {selected ? (
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                          ) : null}
                                        </div>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                          {candidate.class_name || "No class"}
                                        </p>

                                        {candidate.slogan ? (
                                          <p className="mt-3 text-sm font-bold">
                                            “{candidate.slogan}”
                                          </p>
                                        ) : null}

                                        {candidate.manifesto ? (
                                          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                                            {candidate.manifesto}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="sticky bottom-4 rounded-3xl border bg-card/95 p-4 shadow-xl backdrop-blur">
                      <button
                        onClick={handleSubmitVote}
                        disabled={!canSubmit}
                        className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-black text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Vote className="h-5 w-5" />
                        )}
                        Submit Vote
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function AlertBox({ message }: { message: string }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="font-medium">{message}</p>
    </div>
  );
}