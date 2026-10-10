"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, Flame, Send, Wallet } from "lucide-react";
import { Card, PageHeader, PageShell } from "@/components/layout";
import { FEATURE_SECTIONS } from "@/lib/sections";
import { useHydrated, useStoreValue } from "@/lib/use-store";
import { STORE_KEYS } from "@/lib/local-store";
import { bestStreak, habitsDoneToday, type Habit } from "@/lib/habits";
import { formatEUR, monthSummary, type BudgetEntry } from "@/lib/budget";
import { readingStats, type Book } from "@/lib/reading";
import { challengeProgress, type Contact, type Interaction } from "@/lib/outreach";
import { type ContentItem } from "@/lib/content";

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        <Icon size={16} className="text-accent" />
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted">{hint}</div>
    </Card>
  );
}

export default function DashboardHome() {
  const mounted = useHydrated();

  const habits = useStoreValue<Habit[]>(STORE_KEYS.habits, []);
  const entries = useStoreValue<BudgetEntry[]>(STORE_KEYS.budget, []);
  const books = useStoreValue<Book[]>(STORE_KEYS.reading, []);
  const contacts = useStoreValue<Contact[]>(STORE_KEYS.outreach, []);
  const log = useStoreValue<Interaction[]>(STORE_KEYS.outreachLog, []);
  const items = useStoreValue<ContentItem[]>(STORE_KEYS.content, []);

  const now = new Date();
  const budget = monthSummary(entries, now.getFullYear(), now.getMonth() + 1);
  const reading = readingStats(books);
  const outreach = challengeProgress(log);
  const doneToday = habitsDoneToday(habits);

  const emptyWorkspace =
    habits.length === 0 &&
    entries.length === 0 &&
    books.length === 0 &&
    contacts.length === 0 &&
    items.length === 0;

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description={
          mounted
            ? `${now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} — here's where things stand.`
            : "Your personal control center. Pick a section to dig in."
        }
      />

      {mounted && emptyWorkspace && (
        <Card className="border-accent">
          <div className="text-sm">
            <span className="font-semibold text-accent">Welcome to your workspace.</span>{" "}
            <span className="text-muted">
              Every tool below saves straight to this browser — no setup needed. Start anywhere; the
              numbers on this page will follow.
            </span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile
          icon={CheckCircle2}
          label="Habits"
          value={`${doneToday}/${habits.length}`}
          hint={habits.length ? `done today · best streak ${bestStreak(habits)}` : "no habits yet"}
        />
        <StatTile
          icon={Wallet}
          label="Budget"
          value={formatEUR(budget.savings)}
          hint={`${Math.round(budget.savingsRate * 100)}% savings rate this month`}
        />
        <StatTile
          icon={BookOpen}
          label="Reading"
          value={`${reading.finished} finished`}
          hint={reading.reading ? `${reading.reading} in progress` : "nothing in progress"}
        />
        <StatTile
          icon={Send}
          label="Outreach"
          value={`${outreach.days}/${outreach.goal} days`}
          hint={outreach.remaining ? `${outreach.remaining} to go on the challenge` : "challenge complete"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_SECTIONS.map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-surface-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <div className="flex items-center justify-between">
              <Icon size={20} className="text-accent" />
              <span className="text-xs text-muted opacity-0 transition group-hover:opacity-100">
                Open →
              </span>
            </div>
            <div className="mb-1 mt-3 text-sm font-semibold">{label}</div>
            <div className="text-xs text-muted">{description}</div>
          </Link>
        ))}
      </div>

      {mounted && (
        <Card className="flex items-center gap-3 text-xs text-muted">
          <Flame size={14} className="shrink-0 text-accent" />
          All tools except Gratitude store data locally in this browser. Use Settings to export or
          wipe it.
        </Card>
      )}
    </PageShell>
  );
}
