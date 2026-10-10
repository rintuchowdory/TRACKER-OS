import { loadStore, saveStore, STORE_KEYS } from "./local-store";

/** The systematic-engagement challenge: show up 45 days in a row-ish. */
export const CHALLENGE_DAYS = 45;

export interface Contact {
  id: string;
  name: string;
  channel: string;
  note: string;
}

export interface Interaction {
  id: string;
  contactId: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  note: string;
}

export function loadContacts(): Contact[] {
  return loadStore<Contact[]>(STORE_KEYS.outreach, []);
}

export function saveContacts(contacts: Contact[]): void {
  saveStore(STORE_KEYS.outreach, contacts);
}

export function loadLog(): Interaction[] {
  return loadStore<Interaction[]>(STORE_KEYS.outreachLog, []);
}

export function saveLog(log: Interaction[]): void {
  saveStore(STORE_KEYS.outreachLog, log);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addContact(contacts: Contact[], name: string, channel: string, note: string): Contact[] {
  const trimmed = name.trim();
  if (!trimmed) return contacts;
  return [
    ...contacts,
    { id: crypto.randomUUID(), name: trimmed, channel: channel.trim(), note: note.trim() },
  ];
}

export function removeContact(contacts: Contact[], log: Interaction[], id: string): { contacts: Contact[]; log: Interaction[] } {
  return {
    contacts: contacts.filter((c) => c.id !== id),
    log: log.filter((i) => i.contactId !== id),
  };
}

export function logInteraction(
  log: Interaction[],
  contactId: string,
  date: string,
  note: string
): Interaction[] {
  return [
    ...log,
    { id: crypto.randomUUID(), contactId, date, note: note.trim() },
  ];
}

/** Days with at least one interaction — the challenge counts days, not touches. */
export function engagedDays(log: Interaction[]): string[] {
  return [...new Set(log.map((i) => i.date))].sort();
}

export interface OutreachProgress {
  days: number;
  goal: number;
  remaining: number;
  /** 0..1 */
  ratio: number;
}

export function challengeProgress(log: Interaction[]): OutreachProgress {
  const days = engagedDays(log).length;
  const goal = CHALLENGE_DAYS;
  return {
    days,
    goal,
    remaining: Math.max(0, goal - days),
    ratio: Math.min(1, days / goal),
  };
}

export function countPerContact(log: Interaction[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const interaction of log) {
    counts[interaction.contactId] = (counts[interaction.contactId] ?? 0) + 1;
  }
  return counts;
}

export function last14Days(log: Interaction[], today = todayISO()): { date: string; done: boolean }[] {
  const days = new Set(log.map((i) => i.date));
  const out: { date: string; done: boolean }[] = [];
  const cursor = new Date(`${today}T00:00:00`);
  cursor.setDate(cursor.getDate() - 13);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  for (let i = 0; i < 14; i += 1) {
    const date = iso(cursor);
    out.push({ date, done: days.has(date) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
