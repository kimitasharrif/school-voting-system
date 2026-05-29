import { BarChart3, CalendarCheck, Users, Vote } from "lucide-react";

const stats = [
  {
    title: "Total Voters",
    value: "0",
    icon: Users,
  },
  {
    title: "Votes Cast",
    value: "0",
    icon: Vote,
  },
  {
    title: "Active Elections",
    value: "0",
    icon: CalendarCheck,
  },
  {
    title: "Turnout",
    value: "0%",
    icon: BarChart3,
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Election Overview
          </h1>
          <p className="mt-3 text-slate-600">
            Manage school elections, candidates, voters and final tally.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-3xl border bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-6 w-6" />
                </div>

                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-3xl font-black">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-black">Next steps</h2>
          <p className="mt-2 text-slate-600">
            We shall connect this dashboard to Supabase and add election,
            candidate, voter and tally management.
          </p>
        </div>
      </div>
    </main>
  );
}