import { Children, cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../core/utils/cn';

type ButtonVariant = 'primary' | 'ghost' | 'secondary';
type ButtonSize = 'md' | 'sm' | 'lg' | 'xs';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  asChild?: boolean;
};

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)] disabled:pointer-events-none disabled:opacity-60 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[rgb(var(--color-primary))] text-white shadow-elevated hover:brightness-105 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-surface))]',
  ghost:
    'border border-[rgba(var(--color-border),0.6)] bg-transparent text-[rgb(var(--color-text))] hover:border-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary))]',
  secondary:
    'bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-primary))] border border-[rgba(var(--color-primary),0.2)] hover:bg-[rgba(var(--color-primary),0.18)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-7 py-3.5 text-lg',
  xs: 'px-3 py-1.5 text-xs',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', isLoading = false, disabled, asChild = false, children, ...props },
  ref,
) {
  const isDisabled = disabled || isLoading;

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      throw new Error('Button with asChild expects a single valid React element child.');
    }

    const { className: childClassName, ...childProps } = child.props as { className?: string };
    const { type: _type, ...restProps } = props;

    return cloneElement(child, {
      ...childProps,
      ...restProps,
      ref: (ref as unknown) as React.Ref<any>,
      className: cn(baseStyles, variantStyles[variant], sizeStyles[size], childClassName, className),
      'data-disabled': isDisabled ? 'true' : undefined,
      'aria-disabled': isDisabled || undefined,
    });
  }

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span
          className="h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
});
