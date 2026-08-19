"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Send,
  CheckCircle2,
  Wallet,
  BookOpen,
  Heart,
  PenSquare,
  Settings,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/outreach", label: "Outreach", icon: Send },
  { href: "/dashboard/habits", label: "Habits", icon: CheckCircle2 },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/reading", label: "Reading", icon: BookOpen },
  { href: "/dashboard/gratitude", label: "Gratitude", icon: Heart },
  { href: "/dashboard/content", label: "Content", icon: PenSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : true;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("theme", next ? "dark" : "light");
  }

  function handleLogout() {
    setToast("No account system is wired up yet — nothing to log out of.");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-surface-border bg-surface px-3 py-4">
      <div className="flex items-center gap-2 px-2 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
          OT
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Tracker OS</div>
          <div className="text-[10px] uppercase tracking-wide text-muted">
            Workspace
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 border-t border-surface-border pt-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-muted hover:bg-surface-border/60 hover:text-foreground"
              }`}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="relative flex items-center justify-between border-t border-surface-border pt-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-lg p-2 text-muted hover:bg-surface-border/60 hover:text-foreground"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="rounded-lg p-2 text-muted hover:bg-surface-border/60 hover:text-foreground"
        >
          <LogOut size={17} />
        </button>
        {toast && (
          <div className="absolute bottom-12 left-0 right-0 rounded-lg border border-surface-border bg-background px-3 py-2 text-xs text-muted shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </aside>
  );
}
