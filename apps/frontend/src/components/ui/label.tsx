import { forwardRef } from 'react';
import type { LabelHTMLAttributes } from 'react';
import { cn } from '../../core/utils/cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-base font-semibold tracking-tight text-[rgb(var(--color-text))]',
      className,
    )}
    {...props}
  />
));

Label.displayName = 'Label';
