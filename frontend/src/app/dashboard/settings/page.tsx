"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Moon, Sun, Trash2 } from "lucide-react";
import { Card, CardHeading, PageHeader, PageShell } from "@/components/layout";
import { SECTIONS } from "@/lib/sections";
import {
  applyTheme,
  getServerTheme,
  getTheme,
  setTheme,
  subscribeTheme,
} from "@/lib/theme";
import { clearWorkspace, exportWorkspace } from "@/lib/local-store";

export default function SettingsPage() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function downloadExport() {
    const blob = new Blob([exportWorkspace()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tracker-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function wipe() {
    if (!window.confirm("Delete ALL local tracker data? The gratitude journal on the server stays.")) {
      return;
    }
    clearWorkspace();
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  }

  return (
    <PageShell>
      <PageHeader
        icon={SECTIONS.settings.icon}
        title={SECTIONS.settings.label}
        description={SECTIONS.settings.description}
      />

      <Card>
        <CardHeading icon={theme === "dark" ? Moon : Sun}>Appearance</CardHeading>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            Currently using the <span className="font-semibold text-foreground">{theme}</span> theme.
          </p>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm transition hover:border-accent hover:text-accent"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      </Card>

      <Card>
        <CardHeading icon={Download}>Local data</CardHeading>
        <p className="mb-4 text-sm text-muted">
          Habits, budget, reading, outreach, and content live in this browser only.
          Gratitude entries are stored on the server. Export a JSON backup any time.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadExport}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            <Download size={15} /> Export backup
          </button>
          <button
            onClick={wipe}
            className="flex items-center gap-2 rounded-lg border border-surface-border px-4 py-2 text-sm transition hover:border-red-500 hover:text-red-500"
          >
            <Trash2 size={15} /> Delete local data
          </button>
        </div>
        {cleared && (
          <p className="mt-3 text-sm text-accent">Local data deleted. Fresh start.</p>
        )}
      </Card>
    </PageShell>
  );
}
