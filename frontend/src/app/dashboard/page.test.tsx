import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import DashboardHome from "./page";
import { FEATURE_SECTIONS } from "@/lib/sections";

describe("DashboardHome", () => {
  it("links to every feature section with its description", () => {
    render(<DashboardHome />);

    for (const { href, label, description } of FEATURE_SECTIONS) {
      const link = screen.getByRole("link", { name: new RegExp(label) });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveTextContent(description);
    }
  });

  it("does not link to settings, which lives in the sidebar only", () => {
    render(<DashboardHome />);

    expect(screen.queryByRole("link", { name: /Settings/ })).not.toBeInTheDocument();
  });
});
