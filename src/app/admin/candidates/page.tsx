"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserRoundPlus,
  Vote,
} from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";

type Election = {
  id: string;
  title: string;
  status: "draft" | "active" | "closed";
};

type Position = {
  id: string;
  election_id: string;
  title: string;
  description: string | null;
  sort_order: number;
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
  is_active: boolean;
  sort_order: number;
};

type PositionForm = {
  id?: string;
  title: string;
  description: string;
  sortOrder: number;
};

type CandidateForm = {
  id?: string;
  positionId: string;
  name: string;
  className: string;
  photoUrl: string;
  slogan: string;
  manifesto: string;
  isActive: boolean;
  sortOrder: number;
};

const initialPositionForm: PositionForm = {
  title: "",
  description: "",
  sortOrder: 0,
};

const initialCandidateForm: CandidateForm = {
  positionId: "",
  name: "",
  className: "",
  photoUrl: "",
  slogan: "",
  manifesto: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminCandidatesPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [positionForm, setPositionForm] =
    useState<PositionForm>(initialPositionForm);

  const [candidateForm, setCandidateForm] =
    useState<CandidateForm>(initialCandidateForm);

  const [loading, setLoading] = useState(true);
  const [savingPosition, setSavingPosition] = useState(false);
  const [savingCandidate, setSavingCandidate] = useState(false);

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

  async function loadPositionsAndCandidates(electionId: string) {
    setLoading(true);

    try {
      const [positionsResponse, candidatesResponse] = await Promise.all([
        fetch(`/api/admin/positions?electionId=${electionId}`),
        fetch(`/api/admin/candidates?electionId=${electionId}`),
      ]);

      const positionsResult = await positionsResponse.json();
      const candidatesResult = await candidatesResponse.json();

      setPositions(positionsResult.positions ?? []);
      setCandidates(candidatesResult.candidates ?? []);
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
      loadPositionsAndCandidates(selectedElectionId);
    } else {
      setLoading(false);
    }
  }, [selectedElectionId]);

  function resetPositionForm() {
    setPositionForm(initialPositionForm);
  }

  function resetCandidateForm() {
    setCandidateForm(initialCandidateForm);
  }

  function editPosition(position: Position) {
    setPositionForm({
      id: position.id,
      title: position.title,
      description: position.description ?? "",
      sortOrder: position.sort_order,
    });
  }

  function editCandidate(candidate: Candidate) {
    setCandidateForm({
      id: candidate.id,
      positionId: candidate.position_id,
      name: candidate.name,
      className: candidate.class_name ?? "",
      photoUrl: candidate.photo_url ?? "",
      slogan: candidate.slogan ?? "",
      manifesto: candidate.manifesto ?? "",
      isActive: candidate.is_active,
      sortOrder: candidate.sort_order,
    });
  }

  async function handlePositionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedElectionId) {
      alert("Create or select an election first.");
      return;
    }

    setSavingPosition(true);

    try {
      const payload = {
        id: positionForm.id,
        electionId: selectedElectionId,
        title: positionForm.title,
        description: positionForm.description,
        sortOrder: Number(positionForm.sortOrder),
      };

      const response = await fetch("/api/admin/positions", {
        method: positionForm.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Failed to save position.");
        return;
      }

      resetPositionForm();
      await loadPositionsAndCandidates(selectedElectionId);
    } finally {
      setSavingPosition(false);
    }
  }

  async function handleCandidateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedElectionId) {
      alert("Create or select an election first.");
      return;
    }

    if (!candidateForm.positionId) {
      alert("Select a position for this candidate.");
      return;
    }

    setSavingCandidate(true);

    try {
      const payload = {
        id: candidateForm.id,
        electionId: selectedElectionId,
        positionId: candidateForm.positionId,
        name: candidateForm.name,
        className: candidateForm.className,
        photoUrl: candidateForm.photoUrl,
        slogan: candidateForm.slogan,
        manifesto: candidateForm.manifesto,
        isActive: candidateForm.isActive,
        sortOrder: Number(candidateForm.sortOrder),
      };

      const response = await fetch("/api/admin/candidates", {
        method: candidateForm.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Failed to save candidate.");
        return;
      }

      resetCandidateForm();
      await loadPositionsAndCandidates(selectedElectionId);
    } finally {
      setSavingCandidate(false);
    }
  }

  async function deletePosition(id: string) {
    const confirmed = confirm(
      "Delete this position? Candidates and votes linked to it will also be deleted."
    );

    if (!confirmed || !selectedElectionId) return;

    const response = await fetch(`/api/admin/positions?id=${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Failed to delete position.");
      return;
    }

    await loadPositionsAndCandidates(selectedElectionId);
  }

  async function deleteCandidate(id: string) {
    const confirmed = confirm("Delete this candidate?");

    if (!confirmed || !selectedElectionId) return;

    const response = await fetch(`/api/admin/candidates?id=${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Failed to delete candidate.");
      return;
    }

    await loadPositionsAndCandidates(selectedElectionId);
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Positions & Candidates
            </h1>

            <p className="mt-3 text-muted-foreground">
              Create voting positions and add candidates under each position.
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
        ) : (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <div className="space-y-6">
              <form
                onSubmit={handlePositionSubmit}
                className="rounded-3xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Vote className="h-7 w-7" />
                </div>

                <h2 className="text-xl font-black">
                  {positionForm.id ? "Update Position" : "Add Position"}
                </h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-bold">Position Title</label>
                    <input
                      value={positionForm.title}
                      onChange={(event) =>
                        setPositionForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      placeholder="School President"
                      className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Description</label>
                    <textarea
                      value={positionForm.description}
                      onChange={(event) =>
                        setPositionForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Vote for the next school president"
                      className="mt-2 w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Sort Order</label>
                    <input
                      type="number"
                      value={positionForm.sortOrder}
                      onChange={(event) =>
                        setPositionForm((prev) => ({
                          ...prev,
                          sortOrder: Number(event.target.value),
                        }))
                      }
                      className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={savingPosition}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                    >
                      {savingPosition ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {positionForm.id ? "Update" : "Add"}
                    </button>

                    {positionForm.id ? (
                      <button
                        type="button"
                        onClick={resetPositionForm}
                        className="h-12 rounded-2xl border px-5 font-bold hover:bg-muted"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </form>

              <form
                onSubmit={handleCandidateSubmit}
                className="rounded-3xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserRoundPlus className="h-7 w-7" />
                </div>

                <h2 className="text-xl font-black">
                  {candidateForm.id ? "Update Candidate" : "Add Candidate"}
                </h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-bold">Position</label>
                    <select
                      value={candidateForm.positionId}
                      onChange={(event) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          positionId: event.target.value,
                        }))
                      }
                      className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="">Select position</option>
                      {positions.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold">Candidate Name</label>
                    <input
                      value={candidateForm.name}
                      onChange={(event) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Mary Wanjiku"
                      className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Class</label>
                    <input
                      value={candidateForm.className}
                      onChange={(event) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          className: event.target.value,
                        }))
                      }
                      placeholder="Form 4 Blue"
                      className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Photo URL</label>
                    <input
                      value={candidateForm.photoUrl}
                      onChange={(event) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          photoUrl: event.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Slogan</label>
                    <input
                      value={candidateForm.slogan}
                      onChange={(event) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          slogan: event.target.value,
                        }))
                      }
                      placeholder="Leadership with integrity"
                      className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Manifesto</label>
                    <textarea
                      value={candidateForm.manifesto}
                      onChange={(event) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          manifesto: event.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="I will promote discipline and teamwork..."
                      className="mt-2 w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold">Sort Order</label>
                    <input
                      type="number"
                      value={candidateForm.sortOrder}
                      onChange={(event) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          sortOrder: Number(event.target.value),
                        }))
                      }
                      className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border bg-muted/30 p-4 text-sm font-bold">
                    <input
                      type="checkbox"
                      checked={candidateForm.isActive}
                      onChange={(event) =>
                        setCandidateForm((prev) => ({
                          ...prev,
                          isActive: event.target.checked,
                        }))
                      }
                    />
                    Candidate is active
                  </label>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={savingCandidate}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                    >
                      {savingCandidate ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {candidateForm.id ? "Update" : "Add"}
                    </button>

                    {candidateForm.id ? (
                      <button
                        type="button"
                        onClick={resetCandidateForm}
                        className="h-12 rounded-2xl border px-5 font-bold hover:bg-muted"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">Positions & Candidates</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Election: {selectedElection.title}
              </p>

              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              ) : positions.length === 0 ? (
                <div className="mt-6 rounded-2xl border bg-muted/30 p-6 text-muted-foreground">
                  No positions added yet.
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {positions.map((position) => {
                    const positionCandidates = candidates.filter(
                      (candidate) => candidate.position_id === position.id
                    );

                    return (
                      <div
                        key={position.id}
                        className="rounded-2xl border bg-background p-5"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <h3 className="font-black">{position.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {position.description || "No description"}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => editPosition(position)}
                              className="rounded-full border px-4 py-2 text-xs font-bold hover:bg-muted"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => deletePosition(position.id)}
                              className="rounded-full border px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {positionCandidates.length === 0 ? (
                            <p className="rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
                              No candidates under this position.
                            </p>
                          ) : (
                            positionCandidates.map((candidate) => (
                              <div
                                key={candidate.id}
                                className="flex flex-col justify-between gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center"
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-bold">
                                      {candidate.name}
                                    </h4>
                                    {!candidate.is_active ? (
                                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                                        Inactive
                                      </span>
                                    ) : null}
                                  </div>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {candidate.class_name || "No class"} ·{" "}
                                    {candidate.slogan || "No slogan"}
                                  </p>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => editCandidate(candidate)}
                                    className="rounded-full border px-4 py-2 text-xs font-bold hover:bg-muted"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={() =>
                                      deleteCandidate(candidate.id)
                                    }
                                    className="rounded-full border px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}