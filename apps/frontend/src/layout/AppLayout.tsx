import type { SVGProps } from "react";
import { useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CommandPalette, type CommandPaletteHandle, type CommandPaletteItem } from "../components/CommandPalette";
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
    label: "Início",
    description: "Resumo geral e avisos essenciais",
    to: "/app",
    icon: HomeIcon,
    keywords: ["dashboard", "resumo", "inicio"],
    exact: true,
  },
  {
    id: "familia",
    label: "Família",
    description: "Cards individuais de cada familiar",
    to: "/app/familia",
    icon: UsersIcon,
    keywords: ["pacientes", "cartões", "familia"],
  },
  {
    id: "tratamentos",
    label: "Tratamentos",
    description: "Rotinas de medicamentos e terapias",
    to: "/app/tratamentos",
    icon: PillIcon,
    keywords: ["medicamentos", "doses", "rotinas"],
  },
  {
    id: "agenda",
    label: "Agenda",
    description: "Programação de visitas e compromissos",
    to: "/app/agenda",
    icon: CalendarIcon,
    keywords: ["calendario", "avisos", "agenda"],
  },
  {
    id: "insights",
    label: "Insights",
    description: "Relatórios e indicadores da família",
    to: "/app/insights",
    icon: ChartIcon,
    keywords: ["relatorios", "metricas", "dados"],
  },
  {
    id: "configuracoes",
    label: "Configurações",
    description: "Preferências da conta e compartilhamento",
    to: "/app/configuracoes",
    icon: SettingsIcon,
    keywords: ["preferencias", "perfil", "conta"],
  },
] as const;

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const commandPaletteRef = useRef<CommandPaletteHandle | null>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const paletteItems = useMemo<CommandPaletteItem[]>(() => {
    const navigationItems = NAVIGATION_ITEMS.map<CommandPaletteItem>((item) => ({
      id: `nav-${item.id}`,
      label: item.label,
      description: item.description,
      group: "Sessões",
      to: item.to,
      keywords: item.keywords,
    }));

    return [
      ...navigationItems,
      {
        id: "atalho-novo-familiar",
        label: "Cadastrar novo familiar",
        description: "Criar um novo card e iniciar acompanhamento",
        group: "Atalhos",
        to: "/app/familia",
        keywords: ["adicionar", "familia", "novo"],
      },
    ];
  }, []);

  const handleNavigate = (to: string) => {
    setMobileMenuOpen(false);
    navigate(to);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <CommandPalette ref={commandPaletteRef} items={paletteItems} onNavigate={handleNavigate} />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-12">
        <header className="rounded-3xl border border-border bg-surface px-4 py-4 shadow-soft sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-primary/10">
                <AgendaLogo className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/80">Agenda Amiga</span>
                <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">Painel de cuidado</h1>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
              <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((value) => !value)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted transition hover:border-primary/60 hover:text-primary sm:hidden"
                >
                  <span>{isMobileMenuOpen ? "Fechar" : "Menu"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => commandPaletteRef.current?.open()}
                  className="hidden items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-semibold text-muted transition hover:border-primary/60 hover:text-primary lg:flex"
                >
                  <SearchMiniIcon className="h-4 w-4" />
                  <span>Buscar (Ctrl+K)</span>
                </button>
              </div>

              <div className="flex w-full items-center gap-3 rounded-3xl border border-border bg-background px-3 py-2 sm:w-auto">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
                  RA
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">Rodrigo Alves</span>
                  <span className="text-[11px] text-muted">Tutor familiar</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 flex flex-1 gap-6">
          <aside className="hidden w-60 shrink-0 flex-col gap-2 rounded-3xl border border-border bg-surface px-3 py-5 shadow-soft lg:flex">
            <span className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">Navegação</span>
            <nav className="flex flex-col gap-1">
              {NAVIGATION_ITEMS.map((item) => (
                <NavLink
                  key={`side-${item.id}`}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
                      isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-primary/5 hover:text-primary"
                    )
                  }
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-border bg-background">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-[11px] text-muted">{item.description}</span>
                  </div>
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-background">
          <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-primary/10">
                <AgendaLogo className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">Agenda Amiga</span>
                <span className="text-sm font-semibold text-foreground">Escolha uma seção</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl border border-border bg-background px-3 py-1 text-xs font-semibold text-muted transition hover:border-primary/60 hover:text-primary"
            >
              Fechar
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                return (
                  <button
                    key={"mobile-" + item.id}
                    type="button"
                    onClick={() => handleNavigate(item.to)}
                    className={cn(
                      "flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 text-left shadow-soft transition-transform duration-150 hover:-translate-y-0.5 hover:border-primary/40",
                      isActive ? "border-primary/60 shadow-elevated" : undefined
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background text-primary">
                        <item.icon className="h-5 w-5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{item.label}</span>
                        <span className="text-xs text-muted">{item.description}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgendaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x={3.5} y={5} width={17} height={15} rx={5} />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3.5 9h17" />
      <circle cx={10} cy={13} r={0.9} fill="currentColor" stroke="none" />
      <circle cx={14} cy={13} r={0.9} fill="currentColor" stroke="none" />
      <path d="M9.5 16.2c.7.7 1.5 1.1 2.5 1.1s1.8-.4 2.5-1.1" />
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

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <path d="M17 13a3 3 0 1 0 0-6" />
      <path d="M3 21v-1a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v1" />
      <path d="M17 21v-1a4 4 0 0 0-4-4" strokeOpacity={0.6} />
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

function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20V9" />
      <path d="M10 20V4" />
      <path d="M16 20v-8" />
      <path d="M22 20v-5" />
    </svg>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx={12} cy={12} r={3} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function SearchMiniIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx={7} cy={7} r={4.5} />
      <path d="m12.5 12.5-2-2" />
    </svg>
  );
}
