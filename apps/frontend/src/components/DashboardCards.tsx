import type { ReactNode } from "react";

export type StatCardProps = {
  label: string;
  value: string | number;
  help?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, help, icon }: StatCardProps) {
  return (
    <div className="flex flex-1 min-w-[160px] flex-col gap-2 rounded-lg border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted">
        <span>{label}</span>
        {icon && <span className="text-lg text-primary">{icon}</span>}
      </div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
      {help && <p className="text-xs text-muted">{help}</p>}
    </div>
  );
}

export type StatGridProps = {
  children: ReactNode;
};

export function StatGrid({ children }: StatGridProps) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

export type PanelProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Panel({ title, description, actions, children }: PanelProps) {
  return (
    <section className="flex flex-col rounded-lg border border-border bg-surface shadow-soft">
      <header className="flex flex-col gap-2 border-b border-border/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className="flex flex-col gap-4 px-4 py-4">{children}</div>
    </section>
  );
}

