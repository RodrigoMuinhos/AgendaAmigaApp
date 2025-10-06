import type { SVGProps } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

type BottomBarItem = {
  label: string;
  to: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
};

type BottomBarProps = {
  items: readonly BottomBarItem[];
};

export function BottomBar({ items }: BottomBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-5xl px-4 pb-4 lg:hidden">
      <div className="flex items-center gap-2 rounded-3xl border border-border/70 bg-surface/95 p-2 shadow-elevated backdrop-blur">
        {items.map((item) => {
          const isRoot = item.to === "/app";
          const isActive = isRoot ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return (
            <button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition",
                isActive ? "bg-primary text-white shadow-soft" : "text-muted hover:bg-primary/10 hover:text-primary",
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted")} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
