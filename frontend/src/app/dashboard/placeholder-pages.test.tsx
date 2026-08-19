import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import BudgetPage from "./budget/page";
import ContentPage from "./content/page";
import HabitsPage from "./habits/page";
import OutreachPage from "./outreach/page";
import ReadingPage from "./reading/page";
import SettingsPage from "./settings/page";

const PAGES: [string, () => React.ReactElement][] = [
  ["Budget", BudgetPage],
  ["Content", ContentPage],
  ["Habits", HabitsPage],
  ["Outreach", OutreachPage],
  ["Reading", ReadingPage],
  ["Settings", SettingsPage],
];

describe.each(PAGES)("%s page", (label, Page) => {
  it("renders the placeholder for its section", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { name: new RegExp(label) })).toBeInTheDocument();
    expect(screen.getByText("Coming soon.")).toBeInTheDocument();
  });
});
