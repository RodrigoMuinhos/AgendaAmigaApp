import type { ReactNode } from 'react';
import { cn } from '../../../core/utils/cn';

type WizardFieldProps = {
  label: string;
  children: ReactNode;
  error?: string;
  className?: string;
  description?: string;
};

export function WizardField({ label, children, error, className, description }: WizardFieldProps) {
  return (
    <label className={cn('flex flex-col gap-2 text-base text-[rgb(var(--color-text))]', className)}>
      <span className="font-semibold leading-tight">{label}</span>
      {description ? <span className="text-sm text-muted">{description}</span> : null}
      {children}
      <span className="min-h-[1.25rem] text-sm text-[rgb(var(--color-danger))]">{error}</span>
    </label>
  );
}

