import { afterEach, describe, expect, it } from "vitest";

import { addEntry, formatEUR, monthSummary, removeEntry } from "./budget";
import { loadEntries, saveEntries } from "./budget";

const ENTRY = {
  id: "e1",
  type: "expense" as const,
  category: "Groceries",
  amount: 40,
  date: "2026-01-10",
  note: "Weekly shop",
};

afterEach(() => {
  window.localStorage.clear();
});

describe("addEntry", () => {
  it("appends a valid entry", () => {
    const next = addEntry([], { ...ENTRY, type: "income", category: "Salary", amount: 2500, note: "" });
    expect(next).toHaveLength(1);
    expect(next[0].amount).toBe(2500);
  });

  it("rejects non-positive amounts", () => {
    expect(addEntry([], { ...ENTRY, amount: 0 })).toHaveLength(0);
    expect(addEntry([], { ...ENTRY, amount: NaN })).toHaveLength(0);
  });
});

describe("removeEntry", () => {
  it("filters by id", () => {
    expect(removeEntry([ENTRY], "e1")).toHaveLength(0);
    expect(removeEntry([ENTRY], "other")).toHaveLength(1);
  });
});

describe("monthSummary", () => {
  const entries = [
    { ...ENTRY, type: "income" as const, category: "Salary", amount: 2500, date: "2026-01-01" },
    ENTRY,
    { ...ENTRY, id: "e2", category: "Transport", amount: 60, date: "2026-01-15" },
    { ...ENTRY, id: "e3", category: "Groceries", amount: 30, date: "2025-12-31" },
  ];

  it("sums income, spend and savings for the month", () => {
    const summary = monthSummary(entries, 2026, 1);
    expect(summary.income).toBe(2500);
    expect(summary.spend).toBe(100);
    expect(summary.savings).toBe(2400);
    expect(summary.savingsRate).toBeCloseTo(0.96);
  });

  it("groups expenses by category within the month only", () => {
    const summary = monthSummary(entries, 2026, 1);
    expect(summary.byCategory).toEqual({ Groceries: 40, Transport: 60 });
  });

  it("handles an empty month", () => {
    const summary = monthSummary(entries, 2026, 3);
    expect(summary.income).toBe(0);
    expect(summary.savingsRate).toBe(0);
  });
});

describe("formatEUR", () => {
  it("formats amounts in German locale", () => {
    expect(formatEUR(1234.5)).toContain("1.234,50");
  });
});

describe("persistence", () => {
  it("round-trips entries through localStorage", () => {
    saveEntries([ENTRY]);
    expect(loadEntries()).toEqual([ENTRY]);
  });
});
