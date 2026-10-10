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
    description: "The 45-day systematic engagement challenge.",
  },
  habits: {
    href: "/dashboard/habits",
    label: "Habits",
    icon: CheckCircle2,
    description: "Track daily habits, check them off, and build streaks.",
  },
  budget: {
    href: "/dashboard/budget",
    label: "Budget",
    icon: Wallet,
    description: "Log income and expenses, see monthly savings.",
  },
  reading: {
    href: "/dashboard/reading",
    label: "Reading",
    icon: BookOpen,
    description: "Track your shelf, progress, and finished books.",
  },
  gratitude: {
    href: "/dashboard/gratitude",
    label: "Gratitude",
    icon: Heart,
    description: "Daily gratitude journal (synced to server).",
  },
  content: {
    href: "/dashboard/content",
    label: "Content",
    icon: PenSquare,
    description: "Move ideas through drafts to published.",
  },
  settings: {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    description: "Theme, data export, and local data controls.",
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
