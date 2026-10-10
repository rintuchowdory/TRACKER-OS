import { loadStore, saveStore, STORE_KEYS } from "./local-store";

export type Stage = "idea" | "draft" | "published";

export const STAGES: { key: Stage; label: string; blurb: string }[] = [
  { key: "idea", label: "Ideas", blurb: "Raw sparks worth exploring." },
  { key: "draft", label: "Drafts", blurb: "Being written right now." },
  { key: "published", label: "Published", blurb: "Out in the world." },
];

export const NEXT_STAGE: Partial<Record<Stage, Stage>> = {
  idea: "draft",
  draft: "published",
};

export interface ContentItem {
  id: string;
  title: string;
  stage: Stage;
  /** Short free-text type, e.g. "LinkedIn post", "Newsletter", "Video". */
  kind: string;
  updated: string;
}

export function loadItems(): ContentItem[] {
  return loadStore<ContentItem[]>(STORE_KEYS.content, []);
}

export function saveItems(items: ContentItem[]): void {
  saveStore(STORE_KEYS.content, items);
}

export function addItem(items: ContentItem[], title: string, kind: string): ContentItem[] {
  const trimmed = title.trim();
  if (!trimmed) return items;
  return [
    ...items,
    {
      id: crypto.randomUUID(),
      title: trimmed,
      kind: kind.trim(),
      stage: "idea",
      updated: new Date().toISOString().slice(0, 10),
    },
  ];
}

export function removeItem(items: ContentItem[], id: string): ContentItem[] {
  return items.filter((item) => item.id !== id);
}

export function promoteItem(items: ContentItem[], id: string): ContentItem[] {
  return items.map((item) => {
    if (item.id !== id) return item;
    const next = NEXT_STAGE[item.stage];
    if (!next) return item;
    return { ...item, stage: next, updated: new Date().toISOString().slice(0, 10) };
  });
}

export function itemsInStage(items: ContentItem[], stage: Stage): ContentItem[] {
  return items.filter((item) => item.stage === stage);
}
