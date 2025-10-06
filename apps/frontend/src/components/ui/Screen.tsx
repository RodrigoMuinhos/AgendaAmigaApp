// apps/frontend/src/components/ui/Screen.tsx
import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/* ========= ScreenShell ========= */
type ScreenShellProps = {
  children: ReactNode;
  className?: string;
};

export function ScreenShell({ children, className }: ScreenShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-screen-xl px-4 pb-24 pt-10 transition-all sm:px-6 lg:px-8 lg:pb-16",
        className
      )}
    >
      <div className="min-w-0 flex flex-col gap-8">{children}</div>
    </div>
  );
}

/* ========= ScreenHeader ========= */
type ScreenHeaderProps = {
  overline?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function ScreenHeader({
  overline,
  title,
  description,
  actions,
  className,
}: ScreenHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 rounded-3xl border border-border/80 bg-surface/95 px-6 py-6 shadow-elevated lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        {overline ? (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            {overline}
          </span>
        ) : null}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted lg:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-col gap-3 lg:flex-row">{actions}</div>
      ) : null}
    </header>
  );
}

/* ========= ScreenSection ========= */
type ScreenSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  /** Layout do conteúdo interno: 'grid' ou 'stack' (padrão). */
  layout?: "grid" | "stack";
};

export function ScreenSection({
  title,
  description,
  children,
  className,
  actions,
  layout = "stack",
}: ScreenSectionProps) {
  const contentClass =
    layout === "grid" ? "grid gap-5 md:grid-cols-2" : "space-y-5";

  return (
    <section
      className={cn(
        "rounded-3xl border border-border/70 bg-surface/95 px-6 py-6 shadow-soft",
        className
      )}
    >
      <header className="space-y-1 border-b border-border/60 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground lg:text-xl">
              {title}
            </h2>
            {description ? (
              <p className="text-sm text-muted lg:text-base">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex gap-3">{actions}</div> : null}
        </div>
      </header>

      <div className={cn("pt-5", contentClass)}>{children}</div>
    </section>
  );
}
