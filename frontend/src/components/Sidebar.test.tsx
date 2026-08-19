import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

import { Sidebar } from "./Sidebar";
import { NAV_ITEMS } from "@/lib/sections";

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));

vi.mock("next/navigation", () => ({ usePathname }));

beforeEach(() => {
  usePathname.mockReturnValue("/dashboard");
});

afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

describe("navigation", () => {
  it("renders every nav item as a link to its section", () => {
    render(<Sidebar />);

    for (const { href, label } of NAV_ITEMS) {
      expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
  });

  it("marks the exact dashboard route active without matching subroutes", () => {
    usePathname.mockReturnValue("/dashboard/gratitude");
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Dashboard" }).className).not.toContain(
      "text-accent"
    );
    expect(screen.getByRole("link", { name: "Gratitude" }).className).toContain(
      "text-accent"
    );
  });

  it("marks a section active for its nested routes", () => {
    usePathname.mockReturnValue("/dashboard/budget/2026");
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: "Budget" }).className).toContain(
      "text-accent"
    );
  });
});

describe("theme toggle", () => {
  it("applies the stored theme on mount", () => {
    window.localStorage.setItem("theme", "light");
    render(<Sidebar />);

    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("defaults to dark when nothing is stored", () => {
    render(<Sidebar />);

    expect(document.documentElement).toHaveClass("dark");
  });

  it("persists and applies the theme when toggled", () => {
    render(<Sidebar />);
    const toggle = screen.getByRole("button", { name: "Toggle theme" });

    fireEvent.click(toggle);
    expect(window.localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");

    fireEvent.click(toggle);
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });
});

describe("logout", () => {
  it("shows a transient toast explaining there is no account system", () => {
    vi.useFakeTimers();
    render(<Sidebar />);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(screen.getByText(/nothing to log out of/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText(/nothing to log out of/)).not.toBeInTheDocument();
  });
});
