import { Vote } from "lucide-react";

export default function VotePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Vote className="h-7 w-7" />
          </div>

          <h1 className="text-3xl font-black tracking-tight">
            Student Voting
          </h1>

          <p className="mt-3 text-slate-600">
            Enter your voter code or admission number to continue.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
            <input
              placeholder="Enter voter code"
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <button className="h-12 rounded-2xl bg-indigo-600 px-6 font-bold text-white transition hover:bg-indigo-700">
              Continue
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}