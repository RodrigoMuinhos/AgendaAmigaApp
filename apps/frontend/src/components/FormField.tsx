import type { ReactNode } from 'react';
import { Label } from './ui/label';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  description?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
};

export function FormField({ label, htmlFor, description, error, children, required }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="flex items-center gap-2 text-lg">
        {label}
        {required ? <span className="text-sm font-normal text-[rgb(var(--color-danger))]">*</span> : null}
      </Label>
      {description ? <p className="text-base text-muted">{description}</p> : null}
      {children}
      <div role="alert" aria-live="polite" className="min-h-[1.25rem] text-sm text-[rgb(var(--color-danger))]">
        {error}
      </div>
    </div>
  );
}
