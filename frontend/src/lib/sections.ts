import {
  BookOpen,
  CheckCircle2,
  Heart,
  LayoutGrid,
  PenSquare,
  Send,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface Section {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const SECTIONS = {
  outreach: {
    href: "/dashboard/outreach",
    label: "Outreach",
    icon: Send,
    description: "45-day systematic engagement tracker.",
  },
  habits: {
    href: "/dashboard/habits",
    label: "Habits",
    icon: CheckCircle2,
    description: "Daily habit streaks.",
  },
  budget: {
    href: "/dashboard/budget",
    label: "Budget",
    icon: Wallet,
    description: "Income, spend, and savings.",
  },
  reading: {
    href: "/dashboard/reading",
    label: "Reading",
    icon: BookOpen,
    description: "Books in progress and finished.",
  },
  gratitude: {
    href: "/dashboard/gratitude",
    label: "Gratitude",
    icon: Heart,
    description: "Daily gratitude journal.",
  },
  content: {
    href: "/dashboard/content",
    label: "Content",
    icon: PenSquare,
    description: "Content pipeline and drafts.",
  },
  settings: {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    description: "Preferences and workspace configuration.",
  },
} satisfies Record<string, Section>;

const HOME: Section = {
  href: "/dashboard",
  label: "Dashboard",
  icon: LayoutGrid,
  description: "Your personal control center.",
};

/** Sections shown as cards on the dashboard home page. */
export const FEATURE_SECTIONS: Section[] = [
  SECTIONS.outreach,
  SECTIONS.habits,
  SECTIONS.budget,
  SECTIONS.reading,
  SECTIONS.gratitude,
  SECTIONS.content,
];

/** Sidebar navigation, in order. */
export const NAV_ITEMS: Section[] = [HOME, ...FEATURE_SECTIONS, SECTIONS.settings];
