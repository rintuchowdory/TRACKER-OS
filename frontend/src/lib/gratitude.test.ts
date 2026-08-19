import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, type GratitudeEntry } from "./api";
import { canSave, itemsFromEntry, loadJournal, saveToday } from "./gratitude";

const { list, today, save } = vi.hoisted(() => ({
  list: vi.fn(),
  today: vi.fn(),
  save: vi.fn(),
}));

vi.mock("./api", async () => {
  const actual = await vi.importActual<typeof import("./api")>("./api");
  return {
    ...actual,
    api: { gratitude: { list, today, save } },
  };
});

const entry: GratitudeEntry = {
  id: 1,
  entry_date: "2026-01-02",
  item_1: "a",
  item_2: "b",
  item_3: "c",
  created_at: "2026-01-02T03:04:05",
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("itemsFromEntry", () => {
  it("spreads an entry's three items", () => {
    expect(itemsFromEntry(entry)).toEqual(["a", "b", "c"]);
  });

  it("returns three blanks for no entry, without sharing the default array", () => {
    const items = itemsFromEntry(null);
    expect(items).toEqual(["", "", ""]);

    items[0] = "mutated";
    expect(itemsFromEntry(null)).toEqual(["", "", ""]);
  });
});

describe("canSave", () => {
  it("requires at least one non-blank item", () => {
    expect(canSave(["", "", ""], false)).toBe(false);
    expect(canSave(["   ", "", ""], false)).toBe(false);
    expect(canSave(["", "something", ""], false)).toBe(true);
  });

  it("is false while a save is in flight", () => {
    expect(canSave(["something", "", ""], true)).toBe(false);
  });
});

describe("loadJournal", () => {
  it("returns the entry list and today's items", async () => {
    list.mockResolvedValue([entry]);
    today.mockResolvedValue(entry);

    await expect(loadJournal()).resolves.toEqual({
      ok: true,
      data: { entries: [entry], items: ["a", "b", "c"] },
    });
  });

  it("returns blank items when there is no entry for today", async () => {
    list.mockResolvedValue([]);
    today.mockResolvedValue(null);

    const result = await loadJournal();
    expect(result).toEqual({ ok: true, data: { entries: [], items: ["", "", ""] } });
  });

  it("reports the status for a failed response", async () => {
    list.mockRejectedValue(new ApiError(500, "boom"));
    today.mockResolvedValue(null);

    await expect(loadJournal()).resolves.toEqual({
      ok: false,
      error: "Couldn't load journal (500). Is the backend running?",
    });
  });

  it("reports an unreachable backend for a network error", async () => {
    list.mockRejectedValue(new TypeError("fetch failed"));
    today.mockResolvedValue(null);

    await expect(loadJournal()).resolves.toEqual({
      ok: false,
      error: "Couldn't reach the backend. Check NEXT_PUBLIC_API_URL.",
    });
  });
});

describe("saveToday", () => {
  it("maps the three items onto the API payload", async () => {
    save.mockResolvedValue(entry);

    await expect(saveToday(["a", "b", "c"])).resolves.toEqual({ ok: true, data: entry });
    expect(save).toHaveBeenCalledWith({ item_1: "a", item_2: "b", item_3: "c" });
  });

  it("reports the status for a failed response", async () => {
    save.mockRejectedValue(new ApiError(422, "invalid"));

    await expect(saveToday(["a", "b", "c"])).resolves.toEqual({
      ok: false,
      error: "Save failed (422).",
    });
  });

  it("reports a connection problem for a network error", async () => {
    save.mockRejectedValue(new Error("offline"));

    await expect(saveToday(["a", "b", "c"])).resolves.toEqual({
      ok: false,
      error: "Save failed. Check your connection to the backend.",
    });
  });
});
