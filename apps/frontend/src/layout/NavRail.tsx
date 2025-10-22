import { CalendarCheck, Home, IdCard, NotebookPen, Stethoscope, Syringe } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCriancasStore } from '../features/criancas/store';
import { cn } from '../utils/cn';

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  state?: unknown;
};

export function NavRail({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  const isCollapsed = collapsed;

  const { selecionadaId, criancas } = useCriancasStore((state) => ({
    selecionadaId: state.selecionadaId,
    criancas: state.criancas,
  }));

  const criancaSelecionada = useMemo(
    () => criancas.find((item) => item.id === selecionadaId),
    [criancas, selecionadaId],
  );

  const possuiCriancaSelecionada = Boolean(criancaSelecionada);
  const cadernetaVisaoPath = possuiCriancaSelecionada
    ? `/criancas/${criancaSelecionada?.id}/caderneta/visao`
    : '/criancas';
  const cadernetaVisaoState = possuiCriancaSelecionada
    ? undefined
    : { aviso: 'Selecione uma crianca para abrir a caderneta.' };
  const cadernetaVacinacaoPath = possuiCriancaSelecionada
    ? `/criancas/${criancaSelecionada?.id}/caderneta/vacinacao`
    : '/criancas';
  const cadernetaVacinacaoState = possuiCriancaSelecionada
    ? undefined
    : { aviso: 'Selecione uma crianca para consultar o calendario de vacinas.' };

  const items: NavItem[] = [
    { to: '/inicio', label: t('nav.home', 'Inicio'), icon: <Home className="h-6 w-6" aria-hidden /> },
    {
      to: cadernetaVisaoPath,
      label: t('nav.caderneta', 'Caderneta da crianca'),
      icon: <IdCard className="h-6 w-6" aria-hidden />,
      state: cadernetaVisaoState,
    },
    { to: '/care', label: t('nav.careCombined', 'Cuidados'), icon: <Stethoscope className="h-6 w-6" aria-hidden /> },
    {
      to: cadernetaVacinacaoPath,
      label: t('nav.cadernetaVaccination', 'Caderneta de vacinacao'),
      icon: <Syringe className="h-6 w-6" aria-hidden />,
      state: cadernetaVacinacaoState,
    },
    { to: '/routine/today', label: t('nav.routine', 'Rotina'), icon: <CalendarCheck className="h-6 w-6" aria-hidden /> },
    {
      to: '/reports/gastro',
      label: t('nav.gastroReport', 'Relatorio Gastrointestinal'),
      icon: <NotebookPen className="h-6 w-6" aria-hidden />,
    },
  ];

  return (
    <nav
      id="primary-navigation"
      aria-label={t('nav.aria')}
      className={cn('w-full transition-all', isCollapsed ? 'lg:w-24' : 'lg:w-60')}
    >
      <ul
        className={cn(
          'grid grid-cols-3 gap-2 sm:grid-cols-3',
          isCollapsed ? 'lg:flex lg:flex-col lg:items-center lg:gap-2' : 'lg:grid lg:grid-cols-2 lg:gap-3',
        )}
      >
        {items.map((item, index) => (
          <li key={`${item.to}-${index}`}>
            <NavLink
              to={item.to}
              state={item.state}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'mx-auto flex flex-col items-center justify-center gap-1 rounded-3xl border border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.95)] p-3 text-[rgb(var(--color-text))] shadow-soft transition focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)]',
                  isCollapsed ? 'h-16 w-16 text-xs' : 'h-20 w-20 text-sm',
                  isActive
                    ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.12)] shadow-elevated'
                    : 'hover:-translate-y-0.5 hover:border-[rgba(var(--color-primary),0.4)] hover:shadow-elevated',
                )
              }
            >
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]"
              >
                {item.icon}
              </span>
              <span className="sr-only">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
