import { loadStore, saveStore, STORE_KEYS } from "./local-store";

export interface Habit {
  id: string;
  name: string;
  /** ISO dates (YYYY-MM-DD) the habit was completed. */
  completions: string[];
  created: string;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadHabits(): Habit[] {
  return loadStore<Habit[]>(STORE_KEYS.habits, []);
}

export function saveHabits(habits: Habit[]): void {
  saveStore(STORE_KEYS.habits, habits);
}

export function addHabit(habits: Habit[], name: string): Habit[] {
  const trimmed = name.trim();
  if (!trimmed) return habits;
  return [
    ...habits,
    { id: crypto.randomUUID(), name: trimmed, completions: [], created: todayISO() },
  ];
}

export function removeHabit(habits: Habit[], id: string): Habit[] {
  return habits.filter((habit) => habit.id !== id);
}

export function toggleToday(habits: Habit[], id: string, date = todayISO()): Habit[] {
  return habits.map((habit) => {
    if (habit.id !== id) return habit;
    const done = habit.completions.includes(date);
    return {
      ...habit,
      completions: done
        ? habit.completions.filter((d) => d !== date)
        : [...habit.completions, date].sort(),
    };
  });
}

/** Consecutive days ending today (or yesterday, so today still counts). */
export function computeStreak(completions: string[], today = todayISO()): number {
  const days = new Set(completions);
  const cursor = new Date(`${today}T00:00:00`);
  // Allow the streak to be "alive" if today isn't checked yet.
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  while (days.has(iso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** The last 7 days (oldest first) with completion flags. */
export function last7Days(completions: string[], today = todayISO()): { date: string; done: boolean }[] {
  const days = new Set(completions);
  const out: { date: string; done: boolean }[] = [];
  const cursor = new Date(`${today}T00:00:00`);
  cursor.setDate(cursor.getDate() - 6);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  for (let i = 0; i < 7; i += 1) {
    const date = iso(cursor);
    out.push({ date, done: days.has(date) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export function habitsDoneToday(habits: Habit[], today = todayISO()): number {
  return habits.filter((habit) => habit.completions.includes(today)).length;
}

export function bestStreak(habits: Habit[]): number {
  return habits.reduce((best, habit) => Math.max(best, computeStreak(habit.completions)), 0);
}
