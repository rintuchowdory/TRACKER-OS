import { describe, expect, it } from "vitest";

import {
  addHabit,
  bestStreak,
  computeStreak,
  habitsDoneToday,
  last7Days,
  toggleToday,
} from "./habits";

const HABIT = { id: "h1", name: "Read", completions: [], created: "2026-01-01" };

describe("addHabit", () => {
  it("appends a habit with a trimmed name", () => {
    const next = addHabit([HABIT], "  Stretch  ");
    expect(next).toHaveLength(2);
    expect(next[1].name).toBe("Stretch");
    expect(next[1].completions).toEqual([]);
  });

  it("ignores blank names", () => {
    expect(addHabit([HABIT], "   ")).toHaveLength(1);
  });
});

describe("toggleToday", () => {
  it("checks and unchecks a given date", () => {
    const done = toggleToday([HABIT], "h1", "2026-01-02");
    expect(done[0].completions).toEqual(["2026-01-02"]);
    const undone = toggleToday(done, "h1", "2026-01-02");
    expect(undone[0].completions).toEqual([]);
  });
});

describe("computeStreak", () => {
  it("counts consecutive days ending today", () => {
    const today = "2026-01-05";
    const completions = ["2026-01-05", "2026-01-04", "2026-01-03"];
    expect(computeStreak(completions, today)).toBe(3);
  });

  it("keeps the streak alive when today is not checked yet", () => {
    const today = "2026-01-05";
    const completions = ["2026-01-04", "2026-01-03"];
    expect(computeStreak(completions, today)).toBe(2);
  });

  it("returns 0 when the chain is broken", () => {
    const today = "2026-01-05";
    const completions = ["2026-01-02", "2026-01-01"];
    expect(computeStreak(completions, today)).toBe(0);
  });
});

describe("habitsDoneToday", () => {
  it("counts only habits completed on the given day", () => {
    const habits = [
      { ...HABIT, completions: ["2026-01-05"] },
      { ...HABIT, id: "h2", completions: ["2026-01-04"] },
    ];
    expect(habitsDoneToday(habits, "2026-01-05")).toBe(1);
  });
});

describe("bestStreak", () => {
  it("returns the longest current streak across habits", () => {
    const today = new Date().toISOString().slice(0, 10);
    const habits = [
      { ...HABIT, completions: [today] },
      { ...HABIT, id: "h2", completions: [today, "2026-01-04"] },
    ];
    expect(bestStreak(habits)).toBeGreaterThanOrEqual(1);
  });
});

describe("last7Days", () => {
  it("returns seven days ending today with completion flags", () => {
    const today = "2026-01-07";
    const completions = ["2026-01-07", "2026-01-05"];
    const week = last7Days(completions, today);
    expect(week).toHaveLength(7);
    expect(week[6]).toEqual({ date: "2026-01-07", done: true });
    expect(week[4]).toEqual({ date: "2026-01-05", done: true });
    expect(week[3].done).toBe(false);
  });
});
