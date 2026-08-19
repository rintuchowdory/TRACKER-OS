import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { AssistantFab } from "./AssistantFab";

describe("AssistantFab", () => {
  it("starts collapsed", () => {
    render(<AssistantFab />);

    expect(screen.queryByText("Tracker AI Assistant")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle assistant" })).toBeInTheDocument();
  });

  it("toggles the placeholder panel", () => {
    render(<AssistantFab />);
    const toggle = screen.getByRole("button", { name: "Toggle assistant" });

    fireEvent.click(toggle);
    expect(screen.getByText("Tracker AI Assistant")).toBeInTheDocument();
    expect(screen.getByText(/not wired up to a model yet/)).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.queryByText("Tracker AI Assistant")).not.toBeInTheDocument();
  });
});
