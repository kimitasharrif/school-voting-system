"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@schoolvote.local");
  const [password, setPassword] = useState("Admin@2026!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Login failed.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background px-6">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Lock className="h-7 w-7" />
        </div>

        <h1 className="text-3xl font-black tracking-tight">Admin Login</h1>

        <p className="mt-2 text-muted-foreground">
          Sign in to manage elections, candidates, voters and results.
        </p>

        <div className="mt-5 rounded-2xl border bg-muted/40 p-4 text-sm">
          <p className="font-semibold">Test admin account</p>
          <p className="mt-1 text-muted-foreground">
            Email: admin@schoolvote.local
          </p>
          <p className="text-muted-foreground">Password: Admin@2026!</p>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-2xl border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-primary font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}