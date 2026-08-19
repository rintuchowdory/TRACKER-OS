"use client";

import { useEffect, useState } from "react";
import { Heart, Sparkles, CalendarDays } from "lucide-react";
import { api, ApiError, type GratitudeEntry } from "@/lib/api";

const PLACEHOLDERS = [
  "A productive morning...",
  "My health...",
  "Learning something new...",
];

export default function GratitudePage() {
  const [items, setItems] = useState(["", "", ""]);
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function loadEntries() {
    setLoadingEntries(true);
    setLoadError(null);
    try {
      const [list, today] = await Promise.all([
        api.gratitude.list(),
        api.gratitude.today(),
      ]);
      setEntries(list);
      if (today) {
        setItems([today.item_1, today.item_2, today.item_3]);
      }
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? `Couldn't load journal (${err.status}). Is the backend running?`
          : "Couldn't reach the backend. Check NEXT_PUBLIC_API_URL."
      );
    } finally {
      setLoadingEntries(false);
    }
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await api.gratitude.save({
        item_1: items[0],
        item_2: items[1],
        item_3: items[2],
      });
      setSaved(true);
      await loadEntries();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(
        err instanceof ApiError
          ? `Save failed (${err.status}).`
          : "Save failed. Check your connection to the backend."
      );
    } finally {
      setSaving(false);
    }
  }

  const canSave = items.some((i) => i.trim().length > 0) && !saving;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="rounded-xl border border-surface-border bg-surface p-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-accent">
          <Heart size={20} className="fill-accent" />
          Gratitude Journal
        </h1>
        <p className="mt-1 text-sm text-muted">
          Write 3 things you are grateful for today to keep a positive
          mindset.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-xl border border-surface-border bg-surface p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Sparkles size={16} className="text-accent" />
            Today&apos;s Gratitude
          </h2>

          <div className="space-y-4">
            {items.map((value, i) => (
              <div key={i}>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted">
                  {i + 1}. I am grateful for...
                </label>
                <input
                  value={value}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = e.target.value;
                    setItems(next);
                  }}
                  placeholder={PLACEHOLDERS[i]}
                  className="w-full rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Heart size={16} className="fill-accent-foreground" />
            {saving ? "Saving..." : "Save Today's Entry"}
          </button>

          {saved && (
            <p className="mt-2 text-xs text-accent">Saved today&apos;s entry.</p>
          )}
          {saveError && (
            <p className="mt-2 text-xs text-red-400">{saveError}</p>
          )}
        </div>

        <div className="rounded-xl border border-surface-border bg-surface p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <CalendarDays size={16} className="text-accent" />
            Past Entries
          </h2>

          {loadingEntries && (
            <div className="rounded-lg border border-surface-border bg-background px-4 py-6 text-center text-xs uppercase tracking-wide text-muted">
              Loading journal...
            </div>
          )}

          {!loadingEntries && loadError && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/5 px-4 py-4 text-sm text-red-400">
              {loadError}
            </div>
          )}

          {!loadingEntries && !loadError && entries.length === 0 && (
            <div className="rounded-lg border border-surface-border bg-background px-4 py-6 text-center text-sm text-muted">
              No entries yet — save today&apos;s to start your journal.
            </div>
          )}

          {!loadingEntries && !loadError && entries.length > 0 && (
            <ul className="space-y-3">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-surface-border bg-background p-3"
                >
                  <div className="mb-1 text-xs font-medium text-muted">
                    {new Date(entry.entry_date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <ul className="space-y-0.5 text-sm">
                    <li>{entry.item_1}</li>
                    <li>{entry.item_2}</li>
                    <li>{entry.item_3}</li>
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
