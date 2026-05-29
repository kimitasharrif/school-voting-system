"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";

type Election = {
  id: string;
  title: string;
  status: "draft" | "active" | "closed";
};

type Voter = {
  id: string;
  election_id: string;
  full_name: string;
  admission_number: string;
  class_name: string | null;
  voter_code: string;
  is_active: boolean;
  created_at: string;
};

type VoterForm = {
  id?: string;
  fullName: string;
  admissionNumber: string;
  className: string;
  voterCode: string;
  isActive: boolean;
};

const initialForm: VoterForm = {
  fullName: "",
  admissionNumber: "",
  className: "",
  voterCode: "",
  isActive: true,
};

function generateVoterCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `VOTE-${random}`;
}

export default function AdminVotersPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [voters, setVoters] = useState<Voter[]>([]);
  const [form, setForm] = useState<VoterForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  async function loadVoters(electionId: string) {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/voters?electionId=${electionId}`);
      const result = await response.json();

      setVoters(result.voters ?? []);
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
      loadVoters(selectedElectionId);
    } else {
      setLoading(false);
    }
  }, [selectedElectionId]);

  function resetForm() {
    setForm(initialForm);
  }

  function editVoter(voter: Voter) {
    setForm({
      id: voter.id,
      fullName: voter.full_name,
      admissionNumber: voter.admission_number,
      className: voter.class_name ?? "",
      voterCode: voter.voter_code,
      isActive: voter.is_active,
    });
  }

  function generateCodeForForm() {
    setForm((prev) => ({
      ...prev,
      voterCode: generateVoterCode(),
    }));
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedElectionId) {
      alert("Create or select an election first.");
      return;
    }

    if (!form.voterCode) {
      alert("Generate or enter a voter code.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        id: form.id,
        electionId: selectedElectionId,
        fullName: form.fullName,
        admissionNumber: form.admissionNumber,
        className: form.className,
        voterCode: form.voterCode.trim().toUpperCase(),
        isActive: form.isActive,
      };

      const response = await fetch("/api/admin/voters", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Failed to save voter.");
        return;
      }

      resetForm();
      await loadVoters(selectedElectionId);
    } finally {
      setSaving(false);
    }
  }

  async function deleteVoter(id: string) {
    const confirmed = confirm(
      "Delete this voter? Their votes will also be deleted."
    );

    if (!confirmed || !selectedElectionId) return;

    const response = await fetch(`/api/admin/voters?id=${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Failed to delete voter.");
      return;
    }

    await loadVoters(selectedElectionId);
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
              Voters
            </h1>

            <p className="mt-3 text-muted-foreground">
              Register students and generate secure voter codes.
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
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border bg-card p-6 shadow-sm"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="h-7 w-7" />
              </div>

              <h2 className="text-xl font-black">
                {form.id ? "Update Voter" : "Add Voter"}
              </h2>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-bold">Full Name</label>
                  <input
                    value={form.fullName}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      }))
                    }
                    placeholder="John Kamau"
                    className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Admission Number</label>
                  <input
                    value={form.admissionNumber}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        admissionNumber: event.target.value,
                      }))
                    }
                    placeholder="ADM001"
                    className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Class</label>
                  <input
                    value={form.className}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        className: event.target.value,
                      }))
                    }
                    placeholder="Form 4 Blue"
                    className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Voter Code</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={form.voterCode}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          voterCode: event.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="VOTE-ABC123"
                      className="h-12 min-w-0 flex-1 rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                    />

                    <button
                      type="button"
                      onClick={generateCodeForForm}
                      className="h-12 rounded-2xl border px-4 text-sm font-bold hover:bg-muted"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-2xl border bg-muted/30 p-4 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                  Voter is active
                </label>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {form.id ? "Update" : "Add"}
                  </button>

                  {form.id ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="h-12 rounded-2xl border px-5 font-bold hover:bg-muted"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </div>
            </form>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">Registered Voters</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Election: {selectedElection.title}
              </p>

              {loading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              ) : voters.length === 0 ? (
                <div className="mt-6 rounded-2xl border bg-muted/30 p-6 text-muted-foreground">
                  No voters registered yet.
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-2xl border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Admission</th>
                          <th className="px-4 py-3">Class</th>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y">
                        {voters.map((voter) => (
                          <tr key={voter.id} className="bg-background">
                            <td className="px-4 py-3 font-bold">
                              {voter.full_name}
                            </td>
                            <td className="px-4 py-3">
                              {voter.admission_number}
                            </td>
                            <td className="px-4 py-3">
                              {voter.class_name || "-"}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => copyCode(voter.voter_code)}
                                className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 font-bold"
                              >
                                {voter.voter_code}
                                <Copy className="h-3 w-3" />
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              {voter.is_active ? (
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                  Active
                                </span>
                              ) : (
                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                  Disabled
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => editVoter(voter)}
                                  className="rounded-full border px-3 py-2 text-xs font-bold hover:bg-muted"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => deleteVoter(voter.id)}
                                  className="rounded-full border px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}