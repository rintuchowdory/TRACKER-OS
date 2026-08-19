import { afterEach, describe, expect, it, vi } from "vitest";

import {
  applyTheme,
  getServerTheme,
  getTheme,
  setTheme,
  subscribeTheme,
} from "./theme";

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("getTheme", () => {
  it("defaults to dark when nothing is stored", () => {
    expect(getTheme()).toBe("dark");
  });

  it("reads a stored theme", () => {
    window.localStorage.setItem("theme", "light");
    expect(getTheme()).toBe("light");

    window.localStorage.setItem("theme", "dark");
    expect(getTheme()).toBe("dark");
  });

  it("falls back to dark for an unrecognized value", () => {
    window.localStorage.setItem("theme", "sepia");
    expect(getTheme()).toBe("dark");
  });

  it("falls back to dark when localStorage is unavailable", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("access denied");
    });

    expect(getTheme()).toBe("dark");
    vi.restoreAllMocks();
  });
});

describe("getServerTheme", () => {
  it("is dark, since localStorage is unavailable on the server", () => {
    expect(getServerTheme()).toBe("dark");
  });
});

describe("setTheme", () => {
  it("still notifies subscribers when the theme cannot be persisted", () => {
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);

    setTheme("light");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    vi.restoreAllMocks();
  });

  it("persists the theme and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);

    setTheme("light");
    expect(window.localStorage.getItem("theme")).toBe("light");
    expect(getTheme()).toBe("light");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    setTheme("dark");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("subscribeTheme", () => {
  it("also reacts to storage events from other tabs", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);

    window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("applyTheme", () => {
  it("toggles the dark class on the document root", () => {
    applyTheme("dark");
    expect(document.documentElement).toHaveClass("dark");

    applyTheme("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
