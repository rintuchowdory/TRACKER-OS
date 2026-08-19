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
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : DEFAULT_THEME;
}

/** Server snapshot: localStorage is unavailable while rendering on the server. */
export function getServerTheme(): Theme {
  return DEFAULT_THEME;
}

export function setTheme(theme: Theme) {
  window.localStorage.setItem(STORAGE_KEY, theme);
  notify();
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
