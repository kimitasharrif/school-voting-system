import { UserRoundPlus } from "lucide-react";

export default function AdminCandidatesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Candidates
          </h1>

          <p className="mt-3 text-muted-foreground">
            Add and manage candidates for each school election position.
          </p>
        </div>

        <div className="rounded-3xl border bg-card p-8 shadow-sm">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserRoundPlus className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-black">Candidate management</h2>

          <p className="mt-2 text-muted-foreground">
            We will connect this page to the candidates API next.
          </p>
        </div>
      </div>
    </main>
  );
}