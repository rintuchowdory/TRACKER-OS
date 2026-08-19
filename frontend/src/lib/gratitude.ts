import { api, apiErrorMessage, type GratitudeEntry } from "@/lib/api";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export interface Journal {
  entries: GratitudeEntry[];
  items: string[];
}

export const EMPTY_ITEMS = ["", "", ""];

export function itemsFromEntry(entry: GratitudeEntry | null): string[] {
  return entry ? [entry.item_1, entry.item_2, entry.item_3] : [...EMPTY_ITEMS];
}

export function canSave(items: string[], saving: boolean): boolean {
  return !saving && items.some((item) => item.trim().length > 0);
}

export async function loadJournal(): Promise<Result<Journal>> {
  try {
    const [entries, today] = await Promise.all([
      api.gratitude.list(),
      api.gratitude.today(),
    ]);
    return { ok: true, data: { entries, items: itemsFromEntry(today) } };
  } catch (err) {
    console.error("Failed to load gratitude journal", err);
    return {
      ok: false,
      error: apiErrorMessage(
        err,
        (status, detail) => `Couldn't load journal (${status}): ${detail}`,
        "Couldn't reach the backend. Check NEXT_PUBLIC_API_URL."
      ),
    };
  }
}

export async function saveToday(items: string[]): Promise<Result<GratitudeEntry>> {
  try {
    const saved = await api.gratitude.save({
      item_1: items[0],
      item_2: items[1],
      item_3: items[2],
    });
    return { ok: true, data: saved };
  } catch (err) {
    console.error("Failed to save gratitude entry", err);
    return {
      ok: false,
      error: apiErrorMessage(
        err,
        (status, detail) => `Save failed (${status}): ${detail}`,
        "Save failed. Check your connection to the backend."
      ),
    };
  }
}
