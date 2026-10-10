"use client";

import { useState } from "react";
import { ArrowRight, PenSquare, Plus, Trash2 } from "lucide-react";
import { Card, CardHeading, PageHeader, PageShell } from "@/components/layout";
import { SECTIONS } from "@/lib/sections";
import { useStoreValue } from "@/lib/use-store";
import { STORE_KEYS } from "@/lib/local-store";
import {
  addItem,
  itemsInStage,
  loadItems,
  NEXT_STAGE,
  promoteItem,
  removeItem,
  saveItems,
  STAGES,
  type ContentItem,
  type Stage,
} from "@/lib/content";

export default function ContentPage() {
  const items = useStoreValue<ContentItem[]>(STORE_KEYS.content, []);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("LinkedIn post");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    saveItems(addItem(loadItems(), title, kind));
    setTitle("");
  }

  return (
    <PageShell>
      <PageHeader
        icon={SECTIONS.content.icon}
        title={SECTIONS.content.label}
        description={SECTIONS.content.description}
      />

      <Card>
        <CardHeading icon={Plus}>Capture an idea</CardHeading>
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Working title"
            className="min-w-44 flex-1 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            required
          />
          <input
            value={kind}
            onChange={(event) => setKind(event.target.value)}
            placeholder="Kind (post, newsletter…)"
            className="w-52 rounded-lg border border-surface-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Add
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {STAGES.map(({ key, label, blurb }) => {
          const stageItems = itemsInStage(items, key as Stage);
          return (
            <Card key={key}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <PenSquare size={15} className="text-accent" /> {label}
                </div>
                <span className="rounded-full bg-surface-border px-2 py-0.5 text-[11px] font-medium text-muted">
                  {stageItems.length}
                </span>
              </div>
              <p className="mb-3 text-xs text-muted">{blurb}</p>
              <div className="flex flex-col gap-2">
                {stageItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-surface-border p-4 text-center text-xs text-muted">
                    Empty
                  </div>
                ) : (
                  stageItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-surface-border bg-background p-3"
                    >
                      <div className="text-sm font-medium">{item.title}</div>
                      {item.kind && <div className="mt-0.5 text-[11px] text-muted">{item.kind}</div>}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-muted">{item.updated}</span>
                        <span className="flex items-center gap-1.5">
                          {NEXT_STAGE[item.stage as Stage] && (
                            <button
                              onClick={() => saveItems(promoteItem(loadItems(), item.id))}
                              className="flex items-center gap-1 rounded-md border border-surface-border px-2 py-1 text-[11px] transition hover:border-accent hover:text-accent"
                            >
                              {NEXT_STAGE[item.stage as Stage] === "published" ? "Publish" : "Draft"}{" "}
                              <ArrowRight size={11} />
                            </button>
                          )}
                          <button
                            onClick={() => saveItems(removeItem(loadItems(), item.id))}
                            aria-label={`Delete content item ${item.title}`}
                            className="text-muted transition hover:text-red-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
