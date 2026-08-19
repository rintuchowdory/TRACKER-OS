export type Theme = "dark" | "light";

const STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "dark";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Client snapshot: the stored theme, falling back to the default. */
export function getTheme(): Theme {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    console.error("Could not read the stored theme", err);
  }
  return stored === "light" ? "light" : DEFAULT_THEME;
}

/** Server snapshot: localStorage is unavailable while rendering on the server. */
export function getServerTheme(): Theme {
  return DEFAULT_THEME;
}

export function setTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (err) {
    // The preference cannot be persisted (private mode, quota); the theme
    // still applies for this session via the in-memory subscribers.
    console.error("Could not persist the theme preference", err);
  }
  notify();
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
