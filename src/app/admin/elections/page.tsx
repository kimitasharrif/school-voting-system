"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { AdminShell } from "@/components/admin/AdminShell";

type Election = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "closed";
  starts_at: string | null;
  ends_at: string | null;
  show_results_publicly: boolean;
  created_at: string;
};

type ElectionForm = {
  id?: string;
  title: string;
  description: string;
  status: "draft" | "active" | "closed";
  showResultsPublicly: boolean;
};

const initialForm: ElectionForm = {
  title: "",
  description: "",
  status: "draft",
  showResultsPublicly: false,
};

export default function AdminElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [form, setForm] = useState<ElectionForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadElections() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/elections");
      const result = await response.json();

      setElections(result.elections ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadElections();
  }, []);

  function editElection(election: Election) {
    setForm({
      id: election.id,
      title: election.title,
      description: election.description ?? "",
      status: election.status,
      showResultsPublicly: election.show_results_publicly,
    });
  }

  function resetForm() {
    setForm(initialForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    try {
      const response = await fetch("/api/admin/elections", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form.id ? form : { ...form, id: undefined }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.message || "Failed to save election.");
        return;
      }

      resetForm();
      await loadElections();
    } finally {
      setSaving(false);
    }
  }

  async function deleteElection(id: string) {
    const confirmed = confirm(
      "Delete this election? This will delete positions, candidates, voters and votes linked to it."
    );

    if (!confirmed) return;

    const response = await fetch(`/api/admin/elections?id=${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Failed to delete election.");
      return;
    }

    await loadElections();
  }

  async function quickUpdate(
    election: Election,
    values: Partial<ElectionForm>
  ) {
    const response = await fetch("/api/admin/elections", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: election.id,
        title: election.title,
        description: election.description,
        status: election.status,
        showResultsPublicly: election.show_results_publicly,
        ...values,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || "Failed to update election.");
      return;
    }

    await loadElections();
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Elections
          </h1>

          <p className="mt-3 text-muted-foreground">
            Create, update, open, close and publish school elections.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border bg-card p-6 shadow-sm"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarCheck className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-black">
              {form.id ? "Update Election" : "Create Election"}
            </h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-bold">Title</label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Student Council Election 2026"
                  className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="text-sm font-bold">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Annual student leadership election"
                  rows={4}
                  className="mt-2 w-full rounded-2xl border bg-background px-4 py-3 outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="text-sm font-bold">Status</label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as ElectionForm["status"],
                    }))
                  }
                  className="mt-2 h-12 w-full rounded-2xl border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/10"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border bg-muted/30 p-4 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={form.showResultsPublicly}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      showResultsPublicly: event.target.checked,
                    }))
                  }
                />
                Publish results publicly
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
                  {form.id ? "Update" : "Create"}
                </button>

                {form.id ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-12 rounded-2xl border px-5 font-bold transition hover:bg-muted"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black">All Elections</h2>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : elections.length === 0 ? (
              <div className="mt-6 rounded-2xl border bg-muted/30 p-6 text-muted-foreground">
                No elections created yet.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {elections.map((election) => (
                  <div
                    key={election.id}
                    className="rounded-2xl border bg-background p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black">{election.title}</h3>
                          <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase">
                            {election.status}
                          </span>
                          {election.show_results_publicly ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              Results Published
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {election.description || "No description"}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                          ID: {election.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            quickUpdate(election, { status: "active" })
                          }
                          className="rounded-full border px-4 py-2 text-xs font-bold hover:bg-muted"
                        >
                          Open
                        </button>
                        <button
                          onClick={() =>
                            quickUpdate(election, { status: "closed" })
                          }
                          className="rounded-full border px-4 py-2 text-xs font-bold hover:bg-muted"
                        >
                          Close
                        </button>
                        <button
                          onClick={() =>
                            quickUpdate(election, {
                              showResultsPublicly:
                                !election.show_results_publicly,
                            })
                          }
                          className="rounded-full border px-4 py-2 text-xs font-bold hover:bg-muted"
                        >
                          {election.show_results_publicly
                            ? "Hide Results"
                            : "Publish"}
                        </button>
                        <button
                          onClick={() => editElection(election)}
                          className="rounded-full border px-4 py-2 text-xs font-bold hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteElection(election.id)}
                          className="rounded-full border px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}