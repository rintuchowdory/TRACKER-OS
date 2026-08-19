import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import GratitudePage from "./page";
import { ApiError, type GratitudeEntry } from "@/lib/api";

const { list, today, save } = vi.hoisted(() => ({
  list: vi.fn(),
  today: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, api: { gratitude: { list, today, save } } };
});

function entry(overrides: Partial<GratitudeEntry> = {}): GratitudeEntry {
  return {
    id: 1,
    entry_date: "2026-01-02",
    item_1: "a",
    item_2: "b",
    item_3: "c",
    created_at: "2026-01-02T03:04:05",
    ...overrides,
  };
}

function values() {
  return screen
    .getAllByRole("textbox")
    .map((input) => (input as HTMLInputElement).value);
}

function type(index: number, value: string) {
  fireEvent.change(screen.getAllByRole("textbox")[index], { target: { value } });
}

function saveButton() {
  return screen.getByRole("button", { name: /Save Today's Entry|Saving\.\.\./ });
}

beforeEach(() => {
  vi.resetAllMocks();
  list.mockResolvedValue([]);
  today.mockResolvedValue(null);
});

describe("initial load", () => {
  it("shows a loading state, then the empty-journal message", async () => {
    render(<GratitudePage />);
    expect(screen.getByText(/Loading journal/)).toBeInTheDocument();

    expect(await screen.findByText(/No entries yet/)).toBeInTheDocument();
    expect(values()).toEqual(["", "", ""]);
  });

  it("prefills the inputs from today's entry and lists past entries", async () => {
    today.mockResolvedValue(entry({ item_1: "sun", item_2: "coffee", item_3: "gym" }));
    list.mockResolvedValue([entry({ id: 2, item_1: "rain" }), entry()]);

    render(<GratitudePage />);

    await waitFor(() => expect(values()).toEqual(["sun", "coffee", "gym"]));
    expect(screen.getByText("rain")).toBeInTheDocument();
    expect(screen.queryByText(/No entries yet/)).not.toBeInTheDocument();
  });

  it("surfaces a load failure with the response status", async () => {
    list.mockRejectedValue(new ApiError(503, "down"));

    render(<GratitudePage />);

    expect(
      await screen.findByText("Couldn't load journal (503). Is the backend running?")
    ).toBeInTheDocument();
  });
});

describe("saving", () => {
  it("keeps save disabled until an item has non-blank content", async () => {
    render(<GratitudePage />);
    await screen.findByText(/No entries yet/);

    expect(saveButton()).toBeDisabled();

    type(0, "   ");
    expect(saveButton()).toBeDisabled();

    type(0, "gratitude");
    expect(saveButton()).toBeEnabled();
  });

  it("saves the three items, confirms, and refreshes the entry list", async () => {
    render(<GratitudePage />);
    await screen.findByText(/No entries yet/);

    type(0, "one");
    type(1, "two");

    const stored = entry({ item_1: "one", item_2: "two", item_3: "" });
    save.mockResolvedValue(stored);
    list.mockResolvedValue([stored]);
    today.mockResolvedValue(stored);

    fireEvent.click(saveButton());

    expect(await screen.findByText(/Saved today/)).toBeInTheDocument();
    expect(save).toHaveBeenCalledWith({ item_1: "one", item_2: "two", item_3: "" });
    expect(list).toHaveBeenCalledTimes(2);
    expect(values()).toEqual(["one", "two", ""]);
  });

  it("shows an error and no confirmation when the save fails", async () => {
    render(<GratitudePage />);
    await screen.findByText(/No entries yet/);

    type(0, "one");
    save.mockRejectedValue(new ApiError(500, "nope"));

    fireEvent.click(saveButton());

    expect(await screen.findByText("Save failed (500).")).toBeInTheDocument();
    expect(screen.queryByText(/Saved today/)).not.toBeInTheDocument();
    expect(saveButton()).toBeEnabled();
  });
});
