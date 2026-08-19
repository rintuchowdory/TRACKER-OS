"use client";

import { MessageSquare, X } from "lucide-react";
import { useState } from "react";

export function AssistantFab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-xl border border-surface-border bg-surface p-4 shadow-xl">
          <div className="mb-2 text-sm font-semibold">Tracker AI Assistant</div>
          <p className="text-sm text-muted">
            Hi! I&apos;m not wired up to a model yet — this panel is a
            placeholder until the assistant backend is built.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle assistant"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
}
