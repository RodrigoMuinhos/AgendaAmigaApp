import { useMemo } from 'react';
import { ArrowRightCircle, ArrowLeftRight, Bell, Pill, Stethoscope, CalendarCheck, UsersRound, IdCard, Syringe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BigCard } from '../../components/BigCard';
import { Button } from '../../components/ui/button';
import { useEasyMode } from '../../core/hooks/useEasyMode';
import { useCriancasStore } from '../criancas/store';

export function HomePage() {
  const { t } = useTranslation();
  const { enabled: easyMode } = useEasyMode();
  const { selecionadaId, criancas } = useCriancasStore((state) => ({
    selecionadaId: state.selecionadaId,
    criancas: state.criancas,
  }));

  const criancaSelecionada = useMemo(
    () => criancas.find((item) => item.id === selecionadaId),
    [criancas, selecionadaId],
  );

  const possuiCriancaSelecionada = Boolean(criancaSelecionada);
  const cadernetaBasePath = possuiCriancaSelecionada
    ? `/criancas/${criancaSelecionada?.id}/caderneta`
    : undefined;
  const toCaderneta = cadernetaBasePath ? `${cadernetaBasePath}/visao` : '/criancas';
  const toVacinacao = cadernetaBasePath ? `${cadernetaBasePath}/vacinacao` : '/criancas';
  const cadernetaState = possuiCriancaSelecionada
    ? undefined
    : { aviso: 'Selecione uma crianca para abrir a caderneta.' };
  const vacinacaoState = possuiCriancaSelecionada
    ? undefined
    : { aviso: 'Escolha uma crianca para registrar vacinas.' };

  const cards = [
    {
      to: '/care',
      title: t('home.cards.care.title'),
      description: t('home.cards.care.description'),
      icon: <Stethoscope className="h-8 w-8" aria-hidden />,
    },
    {
      to: toCaderneta,
      title: 'Caderneta da Crianca',
      description: 'Veja informacoes gerais, responsaveis e evolucao do cuidado.',
      icon: <IdCard className="h-8 w-8" aria-hidden />,
      state: cadernetaState,
    },
    {
      to: toVacinacao,
      title: 'Caderneta de Vacinacao',
      description: 'Registre doses aplicadas e acompanhe o calendario nacional.',
      icon: <Syringe className="h-8 w-8" aria-hidden />,
      state: vacinacaoState,
    },
    {
      to: '/treatments',
      title: t('home.cards.treatments.title'),
      description: t('home.cards.treatments.description'),
      icon: <Pill className="h-8 w-8" aria-hidden />,
    },
    {
      to: '/routine/today',
      title: t('home.cards.routine.title'),
      description: t('home.cards.routine.description'),
      icon: <CalendarCheck className="h-8 w-8" aria-hidden />,
    },
    {
      to: '/alerts',
      title: t('home.cards.alerts.title'),
      description: t('home.cards.alerts.description'),
      icon: <Bell className="h-8 w-8" aria-hidden />,
    },
    {
      to: '/',
      title: 'Voltar ao inicio',
      description: 'Retorne rapidamente para o painel principal.',
      icon: <ArrowLeftRight className="h-8 w-8" aria-hidden />,
    },
  ];

  return (
    <section className="space-y-10">
      <header className="relative overflow-hidden rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-10">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-[rgba(var(--color-primary),0.12)] via-transparent to-transparent lg:block" />
        <div className="relative space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--color-primary),0.15)] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary))]">
            Agenda Amiga gov.br
          </p>
          <h1 className="text-4xl font-bold text-[rgb(var(--color-primary))]">
            {t('home.hero.title')}
          </h1>
          <p className="max-w-2xl text-lg text-[rgb(var(--color-text))]">
            {t('home.hero.subtitle')}
          </p>
          <Link
            to="/criancas"
            className="group block rounded-3xl border border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.95)] p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-[rgba(var(--color-primary),0.35)] hover:shadow-elevated focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(30,136,229,0.35)] sm:p-5"
          >
            <div className="flex items-start gap-3">
              <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]">
                <UsersRound className="h-6 w-6" />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(var(--color-primary),0.8)]">
                  {t('nav.children', 'Criancas')}
                </p>
                <h2 className="text-xl font-semibold text-[rgb(var(--color-text))]">
                  {criancaSelecionada?.nome ?? t('home.cards.children.title', 'Criancas cadastradas')}
                </h2>
                <p className="text-sm leading-relaxed text-[rgba(var(--color-text),0.68)]">
                  {t('home.cards.children.description', 'Cadastre criancas e mantenha os dados essenciais atualizados.')}
                </p>
              </div>
            </div>
            {criancaSelecionada ? (
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--color-primary))]">
                <span className="inline-block h-2 w-2 rounded-full bg-[rgb(var(--color-primary))]" aria-hidden />
                <span>{criancaSelecionada.nome}</span>
              </div>
            ) : null}
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg"><Link to="/criancas/nova">{t('home.actions.addChild', 'Adicionar crianca')}<ArrowRightCircle className="ml-2 h-6 w-6" aria-hidden /></Link></Button>
            {easyMode ? (
              <span className="rounded-full bg-[rgba(92,107,79,0.2)] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-accent))]">
                {t('app.easyModeDescription')}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(({ icon, ...card }, index) => (
          <BigCard key={`${card.to}-${index}`} {...card} icon={icon} />
        ))}
      </div>
    </section>
  );
}
