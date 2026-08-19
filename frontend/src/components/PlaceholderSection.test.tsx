import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PlaceholderSection } from "./PlaceholderSection";
import { SECTIONS } from "@/lib/sections";

describe("PlaceholderSection", () => {
  it("renders the section label with a not-built-yet message", () => {
    render(<PlaceholderSection section={SECTIONS.habits} />);

    expect(screen.getByRole("heading", { name: /Habits/ })).toBeInTheDocument();
    expect(screen.getByText(/isn't built yet/)).toBeInTheDocument();
    expect(screen.getByText("Coming soon.")).toBeInTheDocument();
  });
});
