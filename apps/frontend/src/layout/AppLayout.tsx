import type { SVGProps } from "react";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../utils/cn";

type NavigationItem = {
  id: string;
  label: string;
  description: string;
  to: string;
  icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  keywords?: string[];
  exact?: boolean;
};

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  {
    id: "home",
    label: "Inicio",
    description: "Resumo geral e avisos essenciais",
    to: "/app",
    icon: HomeIcon,
    keywords: ["dashboard", "resumo", "inicio"],
    exact: true,
  },
  {
    id: "caderneta",
    label: "Caderneta da crianca",
    description: "Visao geral, dados essenciais e evolucao",
    to: "/app/caderneta",
    icon: NotebookIcon,
    keywords: ["crianca", "caderneta", "visao", "dados"],
  },
  {
    id: "vacinacao",
    label: "Caderneta de vacinacao",
    description: "Controle de doses aplicadas e pendentes",
    to: "/app/caderneta/vacinacao",
    icon: SyringeIcon,
    keywords: ["vacinas", "doses", "imunizacao"],
  },
  {
    id: "cuidados",
    label: "Cuidados",
    description: "Consultas, tratamentos e acompanhamentos",
    to: "/app/cuidados",
    icon: PillIcon,
    keywords: ["consultas", "tratamentos", "saude"],
  },
  {
    id: "rotina",
    label: "Rotina",
    description: "Calendario completo e agendamentos",
    to: "/app/rotina",
    icon: CalendarIcon,
    keywords: ["agenda", "calendario", "compromissos"],
  },
  {
    id: "alertas",
    label: "Alertas",
    description: "Avisos e comunicados essenciais",
    to: "/app/alertas",
    icon: BellIcon,
    keywords: ["lembretes", "avisos", "notificacoes"],
  },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderNavigationButtons = (variant: "mobile" | "desktop") =>
    NAVIGATION_ITEMS.map((item) => {
      const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
      const isMobileVariant = variant === "mobile";

      const baseButtonClasses = isMobileVariant
        ? "group flex w-full items-center gap-2 rounded-lg text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40"
        : "group flex w-full items-start gap-3 rounded-xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40";

      const variantClasses = isMobileVariant
        ? "border border-border/50 bg-surface/90 px-3 py-2"
        : "border border-transparent px-3 py-2.5";

      const stateClasses = isActive
        ? "border-primary/50 bg-primary/5 text-primary"
        : "text-muted hover:border-primary/40 hover:bg-primary/5 hover:text-primary";

      const baseIconClasses = isMobileVariant
        ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-inherit transition"
        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-inherit transition";

      const iconVariantClasses = isMobileVariant ? "border-border/50 bg-background" : "border-border/50 bg-background/70";
      const iconStateClasses = isActive ? "border-primary/40 text-primary" : "text-muted group-hover:border-primary/40";

      const descriptionClasses = isActive
        ? "text-xs text-primary/80"
        : "text-xs text-muted group-hover:text-primary/70";

      return (
        <button
          key={`${variant}-${item.id}`}
          type="button"
          onClick={() => handleNavigate(item.to)}
          className={cn(baseButtonClasses, variantClasses, stateClasses)}
        >
          <span className={cn(baseIconClasses, iconVariantClasses, iconStateClasses)}>
            <item.icon className="h-4 w-4" />
          </span>
          <span className={isMobileVariant ? "flex-1 text-sm font-medium leading-tight" : "flex flex-col gap-0.5"}>
            <span className={isMobileVariant ? "block" : "text-sm font-semibold"}>{item.label}</span>
            {!isMobileVariant && <span className={descriptionClasses}>{item.description}</span>}
          </span>
        </button>
      );
    });

  const handleNavigate = (to: string) => {
    setMobileMenuOpen(false);
    navigate(to);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">{/* Side Navigation Drawer - Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-60 transform bg-surface shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-primary/10">
                <AgendaLogo className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-semibold">Agenda Amiga</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 text-muted hover:bg-primary/10 hover:text-primary"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto space-y-1.5 p-3">
            {renderNavigationButtons("mobile")}
          </nav>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-12">
        <header className="rounded-3xl border border-border bg-surface px-4 py-4 shadow-soft sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-primary/10"
              >
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden lg:flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-primary/10">
                <AgendaLogo className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">Agenda Amiga</span>
                <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Painel de cuidado</h1>
              </div>
            </div>

            <div className="flex w-full items-center justify-end gap-2">
              <button
                type="button"
                
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted transition hover:border-primary/60 hover:text-primary"
              >
                <SearchMiniIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Buscar...</span>
                <kbd className="hidden rounded bg-muted/20 px-1.5 font-mono text-[10px] font-medium text-muted sm:inline">Ctrl+K</kbd>
              </button>
            </div>
          </div>
        </header>

        <div className="mt-6 flex flex-1 gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden w-60 shrink-0 flex-col gap-2 rounded-3xl border border-border bg-surface px-3 py-5 shadow-soft lg:flex">
            <span className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">Navegacao</span>
            <nav className="flex flex-col gap-2">
              {renderNavigationButtons("desktop")}
            </nav>
          </aside>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function AgendaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m4 10 8-6 8 6" />
      <path d="M5 9v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
    </svg>
  );
}

function NotebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M8 3v18" />
      <path d="M11 8h5" />
      <path d="M11 12h5" />
      <path d="M11 16h5" />
      <path d="M6 8h.01" />
      <path d="M6 12h.01" />
      <path d="M6 16h.01" />
    </svg>
  );
}

function SyringeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m18 2-4 4" />
      <path d="m22 6-10 10" />
      <path d="m14 6 4 4" />
      <path d="m11 9 4 4" />
      <path d="m7 13 4 4" />
      <path d="m2 22 5-5" />
      <path d="m3 17 4 4" />
    </svg>
  );
}

function PillIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x={3} y={6} width={18} height={12} rx={6} />
      <path d="M12 6v12" />
      <path d="M7 12h10" strokeOpacity={0.6} />
    </svg>
  );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x={3} y={4} width={18} height={17} rx={3} />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M8 15h.01" />
      <path d="M12 15h.01" />
      <path d="M16 15h.01" />
    </svg>
  );
}

function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SearchMiniIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
    </svg>
  );
}


