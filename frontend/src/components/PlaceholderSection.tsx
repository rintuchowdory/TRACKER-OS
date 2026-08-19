import { PageHeader, PageShell } from "@/components/layout";
import type { Section } from "@/lib/sections";

export function PlaceholderSection({ section }: { section: Section }) {
  return (
    <PageShell>
      <PageHeader
        icon={section.icon}
        title={section.label}
        description="This section isn't built yet -- it's next on the list."
      />
      <div className="rounded-xl border border-dashed border-surface-border p-10 text-center text-sm text-muted">
        Coming soon.
      </div>
    </PageShell>
  );
}
