"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, LogOut } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { NAV_ITEMS } from "@/lib/sections";
import {
  applyTheme,
  getServerTheme,
  getTheme,
  setTheme,
  subscribeTheme,
} from "@/lib/theme";

export function Sidebar() {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const isDark = theme === "dark";
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
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
