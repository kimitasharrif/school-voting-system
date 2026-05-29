import { BarChart3 } from "lucide-react";

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <BarChart3 className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-black tracking-tight">
            Election Results
          </h1>

          <p className="mt-3 text-slate-600">
            Published results will appear here after the election is closed.
          </p>
        </div>

        <div className="rounded-3xl border bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-slate-700">
            No published results yet.
          </p>
        </div>
      </div>
    </main>
  );
}