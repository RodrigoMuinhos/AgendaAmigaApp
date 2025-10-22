import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.8)] p-10 text-center shadow-soft">
      {icon ? (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]">
          {icon}
        </span>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[rgb(var(--color-text))]">{title}</h2>
        {description ? <p className="text-base text-[rgba(var(--color-text),0.75)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
