import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../core/utils/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'w-full rounded-2xl border border-[rgba(var(--color-border),0.8)] bg-[rgba(var(--color-surface),0.95)] px-4 py-3 text-lg text-[rgb(var(--color-text))] shadow-sm transition focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-4 focus:ring-[rgba(30,136,229,0.25)]',
    className,
  )}
    {...props}
  />
));

Select.displayName = 'Select';
