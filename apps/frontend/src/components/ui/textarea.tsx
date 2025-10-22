import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../core/utils/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-[rgba(var(--color-border),0.9)] bg-[rgba(var(--color-surface),0.95)] px-4 py-3 text-lg text-[rgb(var(--color-text))] shadow-sm transition placeholder:text-[rgba(var(--color-text),0.55)] focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-4 focus:ring-[rgba(30,136,229,0.25)]',
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
