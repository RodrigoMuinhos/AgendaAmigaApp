import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../core/utils/cn';

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  id?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>;

export function Switch({ checked, onCheckedChange, className, id, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-8 w-16 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--color-primary))]',
        checked ? 'bg-[rgb(var(--color-primary))]' : 'bg-[rgba(var(--color-border),0.4)]',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform',
          checked ? 'translate-x-8' : 'translate-x-1 bg-[rgb(var(--color-surface))]',
        )}
      />
    </button>
  );
}
