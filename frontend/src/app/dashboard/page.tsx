import Link from "next/link";
import { PageHeader, PageShell } from "@/components/layout";
import { FEATURE_SECTIONS } from "@/lib/sections";

export default function DashboardHome() {
  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Your personal control center. Pick a section to dig in."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_SECTIONS.map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-surface-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <Icon size={20} className="mb-3 text-accent" />
            <div className="text-sm font-semibold">{label}</div>
            <div className="mt-1 text-xs text-muted">{description}</div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
