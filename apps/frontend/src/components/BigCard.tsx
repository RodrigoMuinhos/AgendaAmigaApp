import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../core/utils/cn';

type BigCardProps = {
  to: string;
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: string;
  state?: unknown;
};

export function BigCard({ to, title, description, icon, badge, state }: BigCardProps) {
  return (
    <Link
      to={to}
      state={state}
      className="group block focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-surface))]"
    >
      <article
        className={cn(
          'flex h-full flex-col justify-between rounded-3xl border border-transparent bg-[rgb(var(--color-surface))] p-6 shadow-soft transition hover:-translate-y-1 hover:border-[rgba(var(--color-primary),0.25)] hover:shadow-elevated',
          'bg-gradient-to-br from-[rgba(var(--color-primary),0.08)] via-[rgb(var(--color-surface))] to-[rgb(var(--color-surface))]',
        )}
      >
        <div className="flex flex-col gap-4">
          {icon || badge ? (
            <div className="flex items-center justify-between">
              {icon ? (
                <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]">
                  {icon}
                </span>
              ) : (
                <span />
              )}
              {badge ? (
                <span className="rounded-full bg-[rgba(92,107,79,0.15)] px-3 py-1 text-sm font-semibold text-[rgb(var(--color-accent))]">
                  {badge}
                </span>
              ) : null}
            </div>
          ) : null}
          <h3 className="text-2xl font-semibold text-[rgb(var(--color-text))]">{title}</h3>
          <p className="text-lg text-muted">{description}</p>
        </div>
        <span className="mt-8 inline-flex items-center gap-2 text-lg font-semibold text-[rgb(var(--color-primary))]">
          <ArrowRight className="h-6 w-6 transition group-hover:translate-x-1" aria-hidden />
          <span className="sr-only">{title}</span>
        </span>
      </article>
    </Link>
  );
}
