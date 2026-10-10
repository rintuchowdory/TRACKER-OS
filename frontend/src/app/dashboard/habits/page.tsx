"use client";

import { useState } from "react";
import { CheckCircle2, Flame, Plus, Trash2 } from "lucide-react";
import { Card, CardHeading, PageHeader, PageShell } from "@/components/layout";
import { SECTIONS } from "@/lib/sections";
import { useStoreValue } from "@/lib/use-store";
import { STORE_KEYS } from "@/lib/local-store";
import {
  addHabit,
  bestStreak,
  computeStreak,
  habitsDoneToday,
  last7Days,
  loadHabits,
  removeHabit,
  saveHabits,
  toggleToday,
  type Habit,
} from "@/lib/habits";

export default function HabitsPage() {
  const habits = useStoreValue<Habit[]>(STORE_KEYS.habits, []);
  const [name, setName] = useState("");

  const done = habitsDoneToday(habits);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    saveHabits(addHabit(loadHabits(), name));
    setName("");
  }

  return (
    <PageShell>
      <PageHeader
        icon={SECTIONS.habits.icon}
        title={SECTIONS.habits.label}
        description={SECTIONS.habits.description}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent">{done}</div>
          <div className="mt-1 text-xs text-muted">done today</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-accent">{habits.length}</div>
          <div className="mt-1 text-xs text-muted">habits tracked</div>
        </Card>
        <Card className="col-span-2 text-center sm:col-span-1">
          <div className="flex items-center justify-center gap-1.5 text-3xl font-bold text-accent">
            <Flame size={26} className="text-accent" /> {bestStreak(habits)}
          </div>
          <div className="mt-1 text-xs text-muted">best current streak</div>
        </Card>
      </div>

      <Card>
        <CardHeading icon={Plus}>Add a habit</CardHeading>
        <form onSubmit={submit} className="flex gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Read 20 pages, Stretch, No phone before 9"
            className="flex-1 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            Add
          </button>
        </form>
      </Card>

      {habits.length === 0 ? (
        <Card className="text-center text-sm text-muted">
          No habits yet. Small daily wins compound — add your first one above.
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => {
            const todayDone = habit.completions.includes(new Date().toISOString().slice(0, 10));
            const week = last7Days(habit.completions);
            return (
              <Card key={habit.id} className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => saveHabits(toggleToday(loadHabits(), habit.id))}
                  aria-label={todayDone ? `Mark ${habit.name} not done today` : `Mark ${habit.name} done today`}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    todayDone
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-surface-border text-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  <CheckCircle2 size={20} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="truncate">{habit.name}</span>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-surface-border px-2 py-0.5 text-[11px] font-medium text-muted">
                      <Flame size={11} className="text-accent" /> {computeStreak(habit.completions)}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {week.map(({ date, done: dayDone }) => (
                      <div
                        key={date}
                        title={date}
                        className={`h-2.5 w-6 rounded-full ${dayDone ? "bg-accent" : "bg-surface-border"}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => saveHabits(removeHabit(loadHabits(), habit.id))}
                  aria-label={`Delete habit ${habit.name}`}
                  className="text-muted transition hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
