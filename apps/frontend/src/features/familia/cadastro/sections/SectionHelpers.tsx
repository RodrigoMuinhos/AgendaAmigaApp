import type { ReactNode } from "react";

export function SectionCard({ title, actionLabel, onAdd, children }: {
  title: string;
  actionLabel?: string;
  onAdd?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-border/60 bg-background/95 p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl border border-primary/40 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function FormFieldWrapper({ label, error, children }: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {error ? (
        <span className="text-xs font-medium text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function RemoveButton({ onClick, label = "Remover" }: { onClick: () => void; label?: string }) {
  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={onClick}
        className="rounded-xl border border-danger/50 px-3 py-1 text-xs font-semibold text-danger transition hover:bg-danger/10"
      >
        {label}
      </button>
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-muted">{label}</p>;
}
