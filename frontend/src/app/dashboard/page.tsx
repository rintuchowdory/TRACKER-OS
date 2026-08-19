import Link from "next/link";
import { Send, CheckCircle2, Wallet, BookOpen, Heart, PenSquare } from "lucide-react";

const SECTIONS = [
  { href: "/dashboard/outreach", label: "Outreach", icon: Send, desc: "45-day systematic engagement tracker." },
  { href: "/dashboard/habits", label: "Habits", icon: CheckCircle2, desc: "Daily habit streaks." },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet, desc: "Income, spend, and savings." },
  { href: "/dashboard/reading", label: "Reading", icon: BookOpen, desc: "Books in progress and finished." },
  { href: "/dashboard/gratitude", label: "Gratitude", icon: Heart, desc: "Daily gratitude journal." },
  { href: "/dashboard/content", label: "Content", icon: PenSquare, desc: "Content pipeline and drafts." },
];

export default function DashboardHome() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="rounded-xl border border-surface-border bg-surface p-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Your personal control center. Pick a section to dig in.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-surface-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <Icon size={20} className="mb-3 text-accent" />
            <div className="text-sm font-semibold">{label}</div>
            <div className="mt-1 text-xs text-muted">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
