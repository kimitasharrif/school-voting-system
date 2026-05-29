"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  Loader2,
  Plus,
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
  created_at: string;
};

type TallyResponse = {
  success: boolean;
  summary?: {
    totalVoters: number;
    totalVotes: number;
    votersWhoVoted: number;
    turnout: number;
  };
};

export default function AdminDashboardPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [summary, setSummary] = useState({
    totalVoters: 0,
    totalVotes: 0,
    votersWhoVoted: 0,
    turnout: 0,
  });
  const [loading, setLoading] = useState(true);

  const activeElection = useMemo(
    () => elections.find((election) => election.status === "active") ?? elections[0],
    [elections]
  );

  async function loadDashboard() {
    setLoading(true);

    try {
      const electionsResponse = await fetch("/api/admin/elections");
      const electionsResult = await electionsResponse.json();

      const electionList: Election[] = electionsResult.elections ?? [];
      setElections(electionList);

      const targetElection =
        electionList.find((election) => election.status === "active") ??
        electionList[0];

      if (targetElection) {
        const tallyResponse = await fetch(
          `/api/admin/tally?electionId=${targetElection.id}`
        );
        const tallyResult: TallyResponse = await tallyResponse.json();

        if (tallyResult.success && tallyResult.summary) {
          setSummary(tallyResult.summary);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = [
    {
      title: "Total Voters",
      value: summary.totalVoters,
      icon: Users,
    },
    {
      title: "Votes Cast",
      value: summary.totalVotes,
      icon: Vote,
    },
    {
      title: "Active Elections",
      value: elections.filter((election) => election.status === "active").length,
      icon: CalendarCheck,
    },
    {
      title: "Turnout",
      value: `${summary.turnout}%`,
      icon: BarChart3,
    },
  ];

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-primary">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Election Overview
            </h1>
            <p className="mt-3 text-muted-foreground">
              Manage school elections, candidates, voters and final tally.
            </p>
          </div>

          <a
            href="/admin/elections"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Election
          </a>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-3xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
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

            <div className="mt-8 rounded-3xl border bg-card p-8 shadow-sm">
              <h2 className="text-xl font-black">
                {activeElection ? activeElection.title : "No election yet"}
              </h2>

              <p className="mt-2 text-muted-foreground">
                {activeElection
                  ? activeElection.description || "Election is ready for management."
                  : "Create your first school election to start adding positions, candidates and voters."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/admin/elections"
                  className="rounded-full border px-5 py-2 text-sm font-bold transition hover:bg-muted"
                >
                  Manage Elections
                </a>
                <a
                  href="/admin/candidates"
                  className="rounded-full border px-5 py-2 text-sm font-bold transition hover:bg-muted"
                >
                  Manage Candidates
                </a>
                <a
                  href="/admin/voters"
                  className="rounded-full border px-5 py-2 text-sm font-bold transition hover:bg-muted"
                >
                  Manage Voters
                </a>
                <a
                  href="/admin/tally"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                >
                  View Tally
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}