import { loadStore, saveStore, STORE_KEYS } from "./local-store";

export type EntryType = "income" | "expense";

export interface BudgetEntry {
  id: string;
  type: EntryType;
  category: string;
  /** Positive number, in EUR. */
  amount: number;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  note: string;
}

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Groceries",
  "Transport",
  "Subscriptions",
  "Eating out",
  "Health",
  "Other",
] as const;

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Other"] as const;

export function loadEntries(): BudgetEntry[] {
  return loadStore<BudgetEntry[]>(STORE_KEYS.budget, []);
}

export function saveEntries(entries: BudgetEntry[]): void {
  saveStore(STORE_KEYS.budget, entries);
}

export function addEntry(
  entries: BudgetEntry[],
  input: { type: EntryType; category: string; amount: number; date: string; note: string }
): BudgetEntry[] {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return entries;
  return [
    ...entries,
    {
      id: crypto.randomUUID(),
      type: input.type,
      category: input.category,
      date: input.date,
      amount,
      note: input.note.trim(),
    },
  ];
}

export function removeEntry(entries: BudgetEntry[], id: string): BudgetEntry[] {
  return entries.filter((entry) => entry.id !== id);
}

export interface MonthSummary {
  income: number;
  spend: number;
  savings: number;
  /** 0..1 — share of income kept this month. */
  savingsRate: number;
  byCategory: Record<string, number>;
}

export function inMonth(date: string, year: number, month: number): boolean {
  const [y, m] = date.split("-").map(Number);
  return y === year && m === month;
}

export function monthSummary(entries: BudgetEntry[], year: number, month: number): MonthSummary {
  const scoped = entries.filter((entry) => inMonth(entry.date, year, month));
  const income = scoped
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const spend = scoped
    .filter((entry) => entry.type === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const byCategory: Record<string, number> = {};
  for (const entry of scoped.filter((e) => e.type === "expense")) {
    byCategory[entry.category] = (byCategory[entry.category] ?? 0) + entry.amount;
  }
  const savings = income - spend;
  return {
    income,
    spend,
    savings,
    savingsRate: income > 0 ? Math.max(0, Math.min(1, savings / income)) : 0,
    byCategory,
  };
}

export function formatEUR(amount: number): string {
  return amount.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
