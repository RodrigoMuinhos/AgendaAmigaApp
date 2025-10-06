import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type HighlightCardTone = "neutral" | "primary" | "success" | "warning" | "danger";

const toneStyles: Record<HighlightCardTone, string> = {
  neutral: "border-border bg-surface",
  primary: "border-primary/60 bg-primary/10",
  success: "border-success/50 bg-success/10",
  warning: "border-warning/50 bg-warning/10",
  danger: "border-danger/50 bg-danger/10",
};

type HighlightCardProps = {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ReactNode;
  tone?: HighlightCardTone;
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function HighlightCard({
  title,
  subtitle,
  description,
  icon,
  tone = "neutral",
  actions,
  children,
  footer,
  className,
}: HighlightCardProps) {
  const toneClass = toneStyles[tone];

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-3xl border px-5 py-5 shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-soft",
        toneClass,
        className,
      )}
    >
      <header className="relative flex items-start gap-4">
        {icon && <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-xl text-current">{icon}</div>}
        <div className="flex-1 space-y-1 text-foreground">
          {subtitle && <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{subtitle}</div>}
          <h3 className="text-lg font-semibold lg:text-xl">{title}</h3>
          {description && <p className="text-sm text-muted lg:text-base">{description}</p>}
        </div>
        {actions && <div className="relative flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      {children && <div className="relative flex flex-col gap-3 text-sm text-foreground lg:text-base">{children}</div>}
      {footer && <footer className="relative pt-1 text-xs text-muted">{footer}</footer>}
    </article>
  );
}


