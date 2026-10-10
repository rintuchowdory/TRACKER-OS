"use client";

import { useSyncExternalStore } from "react";
import { PREFIX, STORE_EVENT } from "./local-store";

/** Re-render whenever any tracker store is written, or another tab syncs. */
function subscribe(callback: () => void): () => void {
  window.addEventListener(STORE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * getSnapshot must return a cached reference until the underlying raw string
 * changes, otherwise React would loop. We key the cache on the raw value.
 */
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readStore<T>(key: string, fallback: T): T {
  const raw =
    typeof window === "undefined" ? null : window.localStorage.getItem(PREFIX + key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T;
  try {
    value = raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    value = fallback;
  }
  cache.set(key, { raw, value });
  return value;
}

/**
 * Reads a namespaced localStorage value and keeps it fresh across
 * re-renders, other tabs, and writes from any tool page.
 * The server snapshot always returns the fallback, so SSR matches.
 */
export function useStoreValue<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => readStore(key, fallback),
    () => fallback
  );
}

const noopSubscribe = () => () => {};

/** True once the component is running in the browser (after hydration). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
