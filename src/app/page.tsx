import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Users,
  Vote,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden border-b bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.14),transparent_35%),radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_30%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <Vote className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  SchoolVote
                </h1>
                <p className="text-xs text-slate-500">
                  Secure school elections
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/results"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Results
              </Link>
              <Link
                href="/admin/login"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Admin Login
              </Link>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                <ShieldCheck className="h-4 w-4" />
                One student, one vote
              </div>

              <h2 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Secure, transparent and modern school voting system.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Allow students to vote online, prevent duplicate voting, and
                give election admins a clean dashboard for tallying and
                publishing results.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/vote"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                >
                  <Vote className="h-5 w-5" />
                  Vote Now
                </Link>

                <Link
                  href="/results"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  <BarChart3 className="h-5 w-5" />
                  View Results
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <FeatureStat value="100%" label="Digital tally" />
                <FeatureStat value="1x" label="Vote limit" />
                <FeatureStat value="Live" label="Admin results" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Current Election</p>
                    <h3 className="mt-1 text-xl font-bold">
                      Student Council 2026
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="space-y-4">
                  <CandidateCard
                    name="Mary Wanjiku"
                    position="School President"
                    votes="248 votes"
                    percentage="64%"
                  />
                  <CandidateCard
                    name="Brian Otieno"
                    position="School President"
                    votes="139 votes"
                    percentage="36%"
                  />
                  <CandidateCard
                    name="Grace Njeri"
                    position="Secretary"
                    votes="301 votes"
                    percentage="78%"
                  />
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <MiniMetric icon={<Users />} label="Voters" value="540" />
                  <MiniMetric icon={<Vote />} label="Cast" value="421" />
                  <MiniMetric icon={<Lock />} label="Secure" value="Yes" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function CandidateCard({
  name,
  position,
  votes,
  percentage,
}: {
  name: string;
  position: string;
  votes: string;
  percentage: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold">{name}</h4>
          <p className="text-sm text-slate-400">{position}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">{percentage}</p>
          <p className="text-xs text-slate-400">{votes}</p>
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-indigo-400"
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="mb-3 text-indigo-300 [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <p className="text-lg font-black">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}