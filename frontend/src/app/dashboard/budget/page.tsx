import { Wallet } from "lucide-react";

export default function BudgetPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="rounded-xl border border-surface-border bg-surface p-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Wallet size={20} className="text-accent" />
          Budget
        </h1>
        <p className="mt-1 text-sm text-muted">
          This section isn't built yet -- it's next on the list.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-surface-border p-10 text-center text-sm text-muted">
        Coming soon.
      </div>
    </div>
  );
}
