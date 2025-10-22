import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../core/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft transition hover:shadow-elevated focus-within:ring-2 focus-within:ring-[rgba(30,136,229,0.35)]',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('mb-4 space-y-2', className)}>{children}</div>;
}

export function CardTitle({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <h2 className={cn('text-2xl font-semibold text-[rgb(var(--color-text))]', className)}>{children}</h2>;
}

export function CardDescription({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <p className={cn('text-base text-[rgba(var(--color-text),0.65)]', className)}>{children}</p>;
}

export function CardContent({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}
