import type { PropsWithChildren, ReactNode } from 'react';

type CampoProps = PropsWithChildren<{
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
}>;

export function Campo({ id, label, hint, error, required, children }: CampoProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-[rgb(var(--color-text))]">
        {label}
        {required ? <span className="ml-1 text-[rgb(var(--color-primary))]" aria-hidden>*</span> : null}
      </label>
      <div className="flex flex-col gap-2">
        {children}
        {hint ? (
          <p id={hintId} className="text-xs text-[rgba(var(--color-text),0.65)]">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="text-xs font-medium text-red-500">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
