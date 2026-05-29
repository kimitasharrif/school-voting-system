"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  UserRoundPlus,
  Users,
  Vote,
} from "lucide-react";

const links = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/elections",
    label: "Elections",
    icon: CalendarCheck,
  },
  {
    href: "/admin/candidates",
    label: "Candidates",
    icon: UserRoundPlus,
  },
  {
    href: "/admin/voters",
    label: "Voters",
    icon: Users,
  },
  {
    href: "/admin/tally",
    label: "Tally",
    icon: BarChart3,
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r bg-card/95 p-5 shadow-sm lg:block">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Vote className="h-6 w-6" />
          </div>

          <div>
            <h1 className="font-black tracking-tight">SchoolVote</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>

        <nav className="mt-10 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/80 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="font-black">
              SchoolVote Admin
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-xl border px-3 py-2 text-sm font-bold"
            >
              Logout
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </header>

        <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
    </main>
  );
}