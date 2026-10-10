"use client";

import { useState } from "react";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { Card, CardHeading, PageHeader, PageShell } from "@/components/layout";
import { SECTIONS } from "@/lib/sections";
import { useStoreValue } from "@/lib/use-store";
import { STORE_KEYS } from "@/lib/local-store";
import {
  addEntry,
  EXPENSE_CATEGORIES,
  formatEUR,
  INCOME_CATEGORIES,
  loadEntries,
  monthSummary,
  removeEntry,
  saveEntries,
  type BudgetEntry,
  type EntryType,
} from "@/lib/budget";

export default function BudgetPage() {
  const entries = useStoreValue<BudgetEntry[]>(STORE_KEYS.budget, []);
  const now = new Date();
  const summary = monthSummary(entries, now.getFullYear(), now.getMonth() + 1);

  const [type, setType] = useState<EntryType>("expense");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  function switchType(next: EntryType) {
    setType(next);
    setCategory(next === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    saveEntries(
      addEntry(loadEntries(), {
        type,
        category,
        amount: parseFloat(amount),
        date: new Date().toISOString().slice(0, 10),
        note,
      })
    );
    setAmount("");
    setNote("");
  }

  const categories = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]);
  const maxCategory = categories[0]?.[1] ?? 0;

  return (
    <PageShell>
      <PageHeader
        icon={SECTIONS.budget.icon}
        title={SECTIONS.budget.label}
        description={SECTIONS.budget.description}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatEUR(summary.income)}
          </div>
          <div className="mt-1 text-xs text-muted">income this month</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-500">
            {formatEUR(summary.spend)}
          </div>
          <div className="mt-1 text-xs text-muted">spent this month</div>
        </Card>
        <Card className="text-center">
          <div className={`text-2xl font-bold ${summary.savings >= 0 ? "text-accent" : "text-red-500"}`}>
            {formatEUR(summary.savings)}
          </div>
          <div className="mt-1 text-xs text-muted">saved this month</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-bold text-accent">
            <TrendingUp size={20} className="text-accent" />
            {Math.round(summary.savingsRate * 100)}%
          </div>
          <div className="mt-1 text-xs text-muted">savings rate</div>
        </Card>
      </div>

      <Card>
        <CardHeading icon={Plus}>Add income or expense</CardHeading>
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <select
            value={type}
            onChange={(event) => switchType(event.target.value as EntryType)}
            className="rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            aria-label="Type"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            aria-label="Category"
          >
            {(type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount (€)"
            className="w-28 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            required
          />
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Note (optional)"
            className="min-w-36 flex-1 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Add
          </button>
        </form>
      </Card>

      {categories.length > 0 && (
        <Card>
          <CardHeading icon={SECTIONS.budget.icon}>Spending by category</CardHeading>
          <div className="flex flex-col gap-3">
            {categories.map(([name, value]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted">{formatEUR(value)}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-border">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${maxCategory > 0 ? Math.max(3, (value / maxCategory) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {entries.length === 0 ? (
        <Card className="text-center text-sm text-muted">
          No entries yet. Log income first so the savings rate has something to chew on.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {[...entries].reverse().map((entry) => (
            <Card key={entry.id} className="flex items-center gap-3 py-4">
              <span
                className={`w-16 shrink-0 text-xs font-semibold uppercase ${
                  entry.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500"
                }`}
              >
                {entry.type}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{entry.category}</div>
                <div className="truncate text-xs text-muted">
                  {entry.date}
                  {entry.note ? ` · ${entry.note}` : ""}
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold">
                {entry.type === "income" ? "+" : "−"}
                {formatEUR(entry.amount)}
              </span>
              <button
                onClick={() => saveEntries(removeEntry(loadEntries(), entry.id))}
                aria-label={`Delete entry ${entry.category}`}
                className="shrink-0 text-muted transition hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
