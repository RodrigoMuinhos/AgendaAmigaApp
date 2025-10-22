import type { HTMLAttributes } from 'react';
import { cn } from '../../core/utils/cn';

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          'w-full border-separate border-spacing-y-2 text-left text-sm text-[rgb(var(--color-text))]',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('text-xs uppercase tracking-wide text-[rgba(var(--color-text),0.6)]', className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn('divide-y divide-[rgba(var(--color-border),0.2)]', className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'rounded-2xl bg-[rgba(var(--color-surface),0.85)] shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated',
        className,
      )}
      {...props}
    />
  );
}

export function TableHeaderCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-2 font-semibold text-[rgba(var(--color-text),0.7)] first:rounded-l-2xl last:rounded-r-2xl',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('px-4 py-3 align-top text-sm text-[rgba(var(--color-text),0.85)]', className)}
      {...props}
    />
  );
}
