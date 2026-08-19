import type { LucideIcon } from "lucide-react";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex max-w-5xl flex-col gap-6">{children}</div>;
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-surface-border bg-surface p-6${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  accent = false,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <h1
        className={`flex items-center gap-2 text-xl font-semibold${
          accent ? " text-accent" : ""
        }`}
      >
        {Icon && (
          <Icon size={20} className={accent ? "fill-accent" : "text-accent"} />
        )}
        {title}
      </h1>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </Card>
  );
}

export function CardHeading({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
      <Icon size={16} className="text-accent" />
      {children}
    </h2>
  );
}
