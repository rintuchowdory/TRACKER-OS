"use client";

/**
 * Tiny typed localStorage layer shared by all client-side tools.
 * Every tool keeps its data under a "tracker-os:<key>" namespace so
 * Settings can export or wipe the whole workspace in one sweep.
 */

export const PREFIX = "tracker-os:";
export const STORE_KEYS = {
  habits: "habits",
  budget: "budget",
  reading: "reading",
  outreach: "outreach",
  outreachLog: "outreach-log",
  content: "content",
} as const;

/** Event fired on every write so open tabs and the dashboard refresh instantly. */
export const STORE_EVENT = "tracker-os-store";

export function loadStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function saveStore<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: key }));
  } catch {
    // Storage full or unavailable — nothing sensible to do client-side.
  }
}

export function allStoreKeys(): string[] {
  if (typeof window === "undefined") return [];
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(PREFIX)) keys.push(key.slice(PREFIX.length));
  }
  return keys;
}

export function exportWorkspace(): string {
  const dump: Record<string, unknown> = {};
  for (const key of allStoreKeys()) {
    try {
      dump[key] = JSON.parse(window.localStorage.getItem(PREFIX + key) ?? "null");
    } catch {
      dump[key] = null;
    }
  }
  return JSON.stringify({ exported_at: new Date().toISOString(), workspace: dump }, null, 2);
}

export function clearWorkspace(): void {
  for (const key of allStoreKeys()) {
    window.localStorage.removeItem(PREFIX + key);
  }
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}
