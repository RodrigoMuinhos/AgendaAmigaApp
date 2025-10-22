import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../core/utils/cn';

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-5 w-5 rounded-md border-2 border-[rgb(var(--color-border))] accent-[rgb(var(--color-primary))] focus:outline-none focus:ring-4 focus:ring-[rgba(30,136,229,0.25)]',
        className,
      )}
      {...props}
    />
  ),
);

Checkbox.displayName = 'Checkbox';
