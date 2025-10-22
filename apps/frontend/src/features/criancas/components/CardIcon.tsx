import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../core/utils/cn';

type CardIconProps = {
  icon: ReactNode;
  label: string;
  to: string;
  ariaLabel?: string;
  description?: string;
};

export function CardIcon({ icon, label, to, ariaLabel, description }: CardIconProps) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel ?? label}
      className={cn(
        'group flex h-24 items-center gap-4 rounded-3xl border border-transparent bg-[rgb(var(--color-surface))] px-5 shadow-soft transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)]',
        'hover:-translate-y-0.5 hover:border-[rgba(var(--color-primary),0.35)] hover:shadow-elevated',
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-base font-semibold text-[rgb(var(--color-text))]">{label}</span>
        {description ? (
          <span className="text-xs text-[rgba(var(--color-text),0.7)]">{description}</span>
        ) : null}
      </span>
    </Link>
  );
}
