"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Sparkles, CalendarDays } from "lucide-react";
import { type GratitudeEntry } from "@/lib/api";
import { Card, CardHeading, PageHeader, PageShell } from "@/components/layout";
import { SECTIONS } from "@/lib/sections";
import {
  EMPTY_ITEMS,
  canSave as canSaveItems,
  loadJournal,
  saveToday,
} from "@/lib/gratitude";

const PLACEHOLDERS = [
  "A productive morning...",
  "My health...",
  "Learning something new...",
];

export default function GratitudePage() {
  const [items, setItems] = useState(EMPTY_ITEMS);
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const apply = useCallback(
    (result: Awaited<ReturnType<typeof loadJournal>>, keepItems: boolean) => {
      setLoadingEntries(false);
      if (result.ok) {
        setLoadError(null);
        setEntries(result.data.entries);
        if (!keepItems) setItems(result.data.items);
      } else {
        setLoadError(result.error);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    loadJournal().then((result) => {
      if (!cancelled) apply(result, false);
    });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const result = await saveToday(items);
    if (result.ok) {
      setSaved(true);
      apply(await loadJournal(), true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setSaveError(result.error);
    }
    setSaving(false);
  }

  const canSave = canSaveItems(items, saving);

  return (
    <PageShell>
      <PageHeader
        icon={SECTIONS.gratitude.icon}
        title="Gratitude Journal"
        description="Write 3 things you are grateful for today to keep a positive mindset."
        accent
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeading icon={Sparkles}>Today&apos;s Gratitude</CardHeading>

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
        </Card>

        <Card>
          <CardHeading icon={CalendarDays}>Past Entries</CardHeading>

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
        </Card>
      </div>
    </PageShell>
  );
}
