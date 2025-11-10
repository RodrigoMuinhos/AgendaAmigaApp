import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuthStore } from '../auth/store';

type DailyCareEntry = {
  id: string;
  dateISO: string;
  mood: 'sereno' | 'ativo' | 'sensivel' | 'cansado';
  hydration: 'adequada' | 'monitorar' | 'reforcar';
  meals: 'completo' | 'moderado' | 'baixo';
  notes: string;
  createdAt: string;
};

type MoodOption = { value: DailyCareEntry['mood']; label: string; summary: string };
type HydrationOption = { value: DailyCareEntry['hydration']; label: string; summary: string };
type MealOption = { value: DailyCareEntry['meals']; label: string; summary: string };

const moodOptions: MoodOption[] = [
  { value: 'sereno', label: 'Humor tranquilo', summary: 'Crianca calma, receptiva e sem sinais de desconforto.' },
  { value: 'ativo', label: 'Dia ativo', summary: 'Energia alta, explorou brincadeiras e interagiu bastante.' },
  { value: 'sensivel', label: 'Sensivel', summary: 'Precisou de acalento extra ou demonstrou alteracoes de humor.' },
  { value: 'cansado', label: 'Cansaco aparente', summary: 'Apresentou sinais de cansaco; considere reforcar momentos de descanso.' },
];

const moodByValue = moodOptions.reduce<Record<DailyCareEntry['mood'], MoodOption>>((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {} as Record<DailyCareEntry['mood'], MoodOption>);

const hydrationOptions: HydrationOption[] = [
  { value: 'adequada', label: 'Hidratacao em dia', summary: 'Bebeu agua (ou outras bebidas saudaveis) ao longo do dia.' },
  { value: 'monitorar', label: 'Atencao ao consumo', summary: 'Aceitou alguns goles, mas vale oferecer mais vezes.' },
  { value: 'reforcar', label: 'Reforcar ingestao', summary: 'Quase nao bebeu; combine estrategias com os cuidadores.' },
];

const hydrationByValue = hydrationOptions.reduce<Record<DailyCareEntry['hydration'], HydrationOption>>((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {} as Record<DailyCareEntry['hydration'], HydrationOption>);

const mealOptions: MealOption[] = [
  { value: 'completo', label: 'Refeicoes completas', summary: 'Aceitou bem as refeicoes principais e lanches.' },
  { value: 'moderado', label: 'Comeu o essencial', summary: 'Refeicoes reduzidas, mas manteve o essencial do cardapio.' },
  { value: 'baixo', label: 'Pouco apetite', summary: 'Recusou ou comeu pouco; alinhe alternativas e observe sinais.' },
];

const mealByValue = mealOptions.reduce<Record<DailyCareEntry['meals'], MealOption>>((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {} as Record<DailyCareEntry['meals'], MealOption>);

const initialEntries: DailyCareEntry[] = [];
const STORAGE_KEY_PREFIX = 'agenda-amiga:daily-care-entries';

const MOOD_SCALE: Record<DailyCareEntry['mood'], number> = {
  sereno: 3,
  ativo: 2,
  sensivel: 1,
  cansado: 0,
};

const HYDRATION_SCALE: Record<DailyCareEntry['hydration'], number> = {
  adequada: 2,
  monitorar: 1,
  reforcar: 0,
};

const MEAL_SCALE: Record<DailyCareEntry['meals'], number> = {
  completo: 2,
  moderado: 1,
  baixo: 0,
};

function sanitizeEntries(raw: unknown): DailyCareEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return undefined;
      const value = item as Partial<DailyCareEntry>;
      if (
        typeof value.id !== 'string' ||
        typeof value.dateISO !== 'string' ||
        typeof value.mood !== 'string' ||
        typeof value.hydration !== 'string' ||
        typeof value.meals !== 'string' ||
        typeof value.createdAt !== 'string'
      ) {
        return undefined;
      }
      return {
        id: value.id,
        dateISO: value.dateISO,
        mood: value.mood as DailyCareEntry['mood'],
        hydration: value.hydration as DailyCareEntry['hydration'],
        meals: value.meals as DailyCareEntry['meals'],
        notes: typeof value.notes === 'string' ? value.notes : '',
        createdAt: value.createdAt,
      };
    })
    .filter((entry): entry is DailyCareEntry => Boolean(entry));
}

export function DailyCareReportPage() {
  const today = dayjs().format('YYYY-MM-DD');

  const userId = useAuthStore((state) => state.user?.id);
  const storageKey = useMemo(
    () => `${STORAGE_KEY_PREFIX}:${userId && userId.trim().length ? userId : 'anon'}`,
    [userId],
  );

  const [entries, setEntries] = useState<DailyCareEntry[]>(initialEntries);
  const [entryDate, setEntryDate] = useState<string>(today);
  const [mood, setMood] = useState<DailyCareEntry['mood'] | ''>('');
  const [hydration, setHydration] = useState<DailyCareEntry['hydration'] | ''>('');
  const [meals, setMeals] = useState<DailyCareEntry['meals'] | ''>('');
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hydrationGoal, setHydrationGoal] = useState<'adequada' | 'monitorar' | 'reforcar'>('adequada');
  const [hydratedKey, setHydratedKey] = useState<string>(storageKey);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      const sanitized = sanitizeEntries(parsed);
      setEntries(sanitized);
      const latest = sanitized[0];
      setHydrationGoal(latest ? latest.hydration : 'adequada');
    } catch {
      setEntries([]);
      setHydrationGoal('adequada');
    } finally {
      setHydratedKey(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hydratedKey !== storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      // storage unavailable, ignore
    }
  }, [entries, storageKey, hydratedKey]);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          dayjs(b.dateISO).valueOf() - dayjs(a.dateISO).valueOf() ||
          dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
      ),
    [entries],
  );

  const groupedEntries = useMemo(() => {
    const map = new Map<string, DailyCareEntry[]>();
    sortedEntries.forEach((entry) => {
      const list = map.get(entry.dateISO) ?? [];
      list.push(entry);
      map.set(entry.dateISO, list);
    });

    return Array.from(map.entries())
      .map(([dateISO, list]) => ({
        dateISO,
        items: list.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()),
      }))
      .sort((a, b) => dayjs(b.dateISO).valueOf() - dayjs(a.dateISO).valueOf());
  }, [sortedEntries]);

  const todayEntries = useMemo(
    () => sortedEntries.filter((entry) => entry.dateISO === today),
    [sortedEntries, today],
  );

  const lastEntry = sortedEntries[0];
  const lastMoodInfo = lastEntry ? moodByValue[lastEntry.mood] : undefined;
  const firstTodayEntry = todayEntries[0];
  const todayHydrationInfo = firstTodayEntry ? hydrationByValue[firstTodayEntry.hydration] : undefined;
  const todayMealInfo = firstTodayEntry ? mealByValue[firstTodayEntry.meals] : undefined;
  const hydrationGoalLabel = hydrationByValue[hydrationGoal]?.label ?? 'Hidratacao em dia';
  const recentWindow = useMemo(() => sortedEntries.slice(0, 7).reverse(), [sortedEntries]);
  const moodTrend = useMemo(
    () =>
      recentWindow.map((entry) => ({
        label: dayjs(entry.dateISO).format('DD/MM'),
        value: MOOD_SCALE[entry.mood],
        description: moodByValue[entry.mood].label,
      })),
    [recentWindow],
  );
  const hydrationTrend = useMemo(
    () =>
      recentWindow.map((entry) => ({
        label: dayjs(entry.dateISO).format('DD/MM'),
        value: HYDRATION_SCALE[entry.hydration],
        description: hydrationByValue[entry.hydration].label,
      })),
    [recentWindow],
  );
  const mealTrend = useMemo(
    () =>
      recentWindow.map((entry) => ({
        label: dayjs(entry.dateISO).format('DD/MM'),
        value: MEAL_SCALE[entry.meals],
        description: mealByValue[entry.meals].label,
      })),
    [recentWindow],
  );

  const canSubmit = Boolean(entryDate && mood && hydration && meals);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const newEntry: DailyCareEntry = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
      dateISO: entryDate,
      mood: mood as DailyCareEntry['mood'],
      hydration: hydration as DailyCareEntry['hydration'],
      meals: meals as DailyCareEntry['meals'],
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setEntries((current) => [newEntry, ...current]);
    setHydrationGoal(newEntry.hydration);
    setMood('');
    setHydration('');
    setMeals('');
    setNotes('');
    setFeedback('Registro adicionado com sucesso.');
  };

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  return (
    <section className="space-y-8 lg:space-y-10">
      <header className="space-y-3 rounded-3xl bg-[rgb(var(--color-surface))] p-6 text-[rgb(var(--color-text))] shadow-soft lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[rgba(var(--color-primary),0.75)]">
          Painel Agenda Amiga
        </p>
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">Relatorio diario de cuidados</h1>
        <p className="max-w-3xl text-base text-[rgba(var(--color-text),0.75)]">
          Registre como a crianca passou o dia para combinar a rotina com familiares e profissionais de saude. Os
          registros ajudam a acompanhar humor, ingestao de liquidos e alimentacao de forma simples.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none bg-[rgba(var(--color-surface),0.9)] shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[rgb(var(--color-text))]">Guia rapido</CardTitle>
            <CardDescription className="text-sm leading-relaxed text-[rgba(var(--color-text),0.7)]">
              Use as anotacoes em conjunto com o caderno da familia. Itens marcados aqui ficam disponiveis para quem
              compartilha o cuidado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[rgba(var(--color-text),0.75)]">
            <p>- Selecione o humor geral da crianca com base nas interacoes do dia.</p>
            <p>- Atualize hidratacao e alimentacao para identificar pontos de atencao rapidamente.</p>
            <p>- Utilize o campo de observacoes para recados, combinados e orientacoes de profissionais.</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-[rgba(var(--color-surface),0.9)] shadow-soft">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-[rgb(var(--color-text))]">Resumo do dia</CardTitle>
              <CardDescription className="text-sm text-[rgba(var(--color-text),0.7)]">
                Atualiza automaticamente quando voce salva um registro.
              </CardDescription>
            </div>
            <span className="rounded-full border border-[rgba(var(--color-border),0.5)] px-4 py-1 text-xs font-semibold text-[rgb(var(--color-primary))]">
              {todayEntries.length} registro{todayEntries.length === 1 ? '' : 's'} hoje
            </span>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryItem
                  title="Registros de hoje"
                  value={todayEntries.length ? `${todayEntries.length}` : '--'}
                  subtitle={
                    todayEntries.length
                      ? `${todayEntries.length} anotacao${todayEntries.length > 1 ? 'es' : ''} sincronizada${todayEntries.length > 1 ? 's' : ''}.`
                      : 'Marque o primeiro registro para iniciar o acompanhamento.'
                  }
                />
                <SummaryItem
                  title="Humor predominante"
                  value={lastMoodInfo?.label ?? '--'}
                  subtitle={lastMoodInfo?.summary ?? 'Aguarde o primeiro registro para avaliar o humor do dia.'}
                />
                <SummaryItem
                  title="Hidratacao"
                  value={todayHydrationInfo?.label ?? '--'}
                  subtitle={todayHydrationInfo?.summary ?? 'Assim que registrar, mostramos o status combinado.'}
                />
                <SummaryItem
                  title="Alimentacao"
                  value={todayMealInfo?.label ?? '--'}
                  subtitle={todayMealInfo?.summary ?? 'Registre uma refeicao para acompanhar o apetite.'}
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <TrendCard
                  title="Humor nos ultimos dias"
                  current={lastMoodInfo?.label ?? 'Aguardando registros'}
                  trend={moodTrend}
                  scaleMax={3}
                  emptyMessage="Registre pelo menos um humor para iniciar o grafico."
                />
                <TrendCard
                  title="Hidratacao monitorada"
                  current={`${todayHydrationInfo?.label ?? 'Aguardando registros'} - Meta: ${hydrationGoalLabel}`}
                  trend={hydrationTrend}
                  scaleMax={2}
                  emptyMessage="Registre a ingestao de liquidos para visualizar a curva."
                />
                <TrendCard
                  title="Apetite observado"
                  current={todayMealInfo?.label ?? 'Aguardando registros'}
                  trend={mealTrend}
                  scaleMax={2}
                  emptyMessage="Informe as refeicoes para acompanhar a tendencia."
                />
              </div>
            </CardContent>
          </Card>
        </section>

      <section className="rounded-3xl border border-dashed border-[rgba(var(--color-border),0.35)] bg-[rgba(var(--color-surface),0.95)] p-6 shadow-soft lg:p-8">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-[rgb(var(--color-text))]">Novo registro</h2>
          <p className="text-sm text-[rgba(var(--color-text),0.7)]">
            Preencha os campos abaixo e clique em adicionar para compartilhar o panorama do dia.
          </p>
        </header>

        <form className="mt-6 grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[rgb(var(--color-text))]">Data</span>
            <input
              className="w-full rounded-xl border border-[rgba(var(--color-border),0.5)] bg-[rgb(var(--color-surface))] px-4 py-3 text-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-4 focus:ring-[rgba(30,136,229,0.25)]"
              type="date"
              value={entryDate}
              max={today}
              onChange={(event) => setEntryDate(event.currentTarget.value)}
            />
            <span className="block text-xs text-[rgba(var(--color-text),0.55)]">
              Registre um dia anterior caso esteja atualizando a caderneta.
            </span>
          </label>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[rgb(var(--color-text))]">Humor do dia</legend>
            <p className="text-xs text-[rgba(var(--color-text),0.6)]">
              Escolha a opcao que mais representa o comportamento geral.
            </p>
            <div className="space-y-2">
              {moodOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    mood === option.value
                      ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-text))] shadow-soft'
                      : 'border-[rgba(var(--color-border),0.45)] text-[rgba(var(--color-text),0.75)] hover:-translate-y-0.5 hover:border-[rgba(var(--color-primary),0.35)] hover:shadow-soft'
                  }`}
                >
                  <input
                    className="mt-1 h-4 w-4 shrink-0 rounded border-[rgba(var(--color-border),0.5)] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                    type="radio"
                    name="mood"
                    value={option.value}
                    checked={mood === option.value}
                    onChange={(event) => setMood(event.currentTarget.value as DailyCareEntry['mood'])}
                  />
                  <span>
                    <span className="font-semibold text-[rgb(var(--color-text))]">{option.label}</span>
                    <span className="block text-xs text-[rgba(var(--color-text),0.6)]">{option.summary}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[rgb(var(--color-text))]">Hidratacao</legend>
            <p className="text-xs text-[rgba(var(--color-text),0.6)]">Como ficou o consumo de liquidos hoje?</p>
            <div className="space-y-2">
              {hydrationOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    hydration === option.value
                      ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-text))] shadow-soft'
                      : 'border-[rgba(var(--color-border),0.45)] text-[rgba(var(--color-text),0.75)] hover:-translate-y-0.5 hover:border-[rgba(var(--color-primary),0.35)] hover:shadow-soft'
                  }`}
                >
                  <input
                    className="mt-1 h-4 w-4 shrink-0 rounded border-[rgba(var(--color-border),0.5)] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                    type="radio"
                    name="hydration"
                    value={option.value}
                    checked={hydration === option.value}
                    onChange={(event) => setHydration(event.currentTarget.value as DailyCareEntry['hydration'])}
                  />
                  <span>
                    <span className="font-semibold text-[rgb(var(--color-text))]">{option.label}</span>
                    <span className="block text-xs text-[rgba(var(--color-text),0.6)]">{option.summary}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[rgb(var(--color-text))]">Alimentacao</legend>
            <p className="text-xs text-[rgba(var(--color-text),0.6)]">Registre como foi a aceitacao das refeicoes.</p>
            <div className="space-y-2">
              {mealOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                    meals === option.value
                      ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.1)] text-[rgb(var(--color-text))] shadow-soft'
                      : 'border-[rgba(var(--color-border),0.45)] text-[rgba(var(--color-text),0.75)] hover:-translate-y-0.5 hover:border-[rgba(var(--color-primary),0.35)] hover:shadow-soft'
                  }`}
                >
                  <input
                    className="mt-1 h-4 w-4 shrink-0 rounded border-[rgba(var(--color-border),0.5)] text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]"
                    type="radio"
                    name="meals"
                    value={option.value}
                    checked={meals === option.value}
                    onChange={(event) => setMeals(event.currentTarget.value as DailyCareEntry['meals'])}
                  />
                  <span>
                    <span className="font-semibold text-[rgb(var(--color-text))]">{option.label}</span>
                    <span className="block text-xs text-[rgba(var(--color-text),0.6)]">{option.summary}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="lg:col-span-2">
            <span className="text-sm font-semibold text-[rgb(var(--color-text))]">Observacoes compartilhadas</span>
            <textarea
              className="mt-2 h-32 w-full resize-y rounded-xl border border-[rgba(var(--color-border),0.5)] bg-[rgb(var(--color-surface))] px-4 py-3 text-sm leading-relaxed focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-4 focus:ring-[rgba(30,136,229,0.25)]"
              value={notes}
              placeholder="Ex.: Conversamos com a fono, combinar retorno em 10 dias. Gostou de historia antes de dormir."
              onChange={(event) => setNotes(event.currentTarget.value)}
            />
            <span className="mt-1 block text-xs text-[rgba(var(--color-text),0.55)]">
              Compartilhe detalhes como orientacoes de profissionais, reacoes a medicamentos ou combinados familiares.
            </span>
          </label>

          <div className="lg:col-span-2 space-y-3">
            {feedback ? (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-3 rounded-2xl border border-[rgba(var(--color-success),0.4)] bg-[rgba(var(--color-success),0.12)] px-4 py-3 text-sm text-[rgb(var(--color-success))]"
              >
                <span aria-hidden className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--color-success),0.5)]">
                OK
                </span>
                <span>{feedback}</span>
              </div>
            ) : null}
            <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">
              Adicionar registro
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[rgb(var(--color-text))]">Historico recente</h2>
            <p className="text-sm text-[rgba(var(--color-text),0.7)]">
              Agrupamos por data para que voce acompanhe a evolucao semanal rapidamente.
            </p>
          </div>
          <span className="rounded-full bg-[rgba(var(--color-primary),0.12)] px-4 py-2 text-xs font-semibold text-[rgb(var(--color-primary))]">
            {entries.length} registro{entries.length === 1 ? '' : 's'} salvos
          </span>
        </header>

        {entries.length === 0 ? (
          <Card className="border border-dashed border-[rgba(var(--color-border),0.45)] bg-[rgba(var(--color-surface),0.35)] text-center shadow-soft">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-semibold text-[rgb(var(--color-text))]">Nenhum registro ainda</p>
              <p className="text-sm text-[rgba(var(--color-text),0.7)]">
                Adicione o primeiro relato para visualizar aqui o historico por dia.
              </p>
            </CardContent>
          </Card>
        ) : (
          groupedEntries.map((group) => (
            <Card key={group.dateISO} className="border border-dashed border-[rgba(var(--color-border),0.45)] bg-[rgba(var(--color-surface),0.95)] shadow-soft">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-[rgb(var(--color-text))]">
                    {dayjs(group.dateISO).format('DD/MM/YYYY')}
                  </CardTitle>
                  <CardDescription className="text-sm text-[rgba(var(--color-text),0.65)]">
                    {weekDayLabel(group.dateISO)}
                  </CardDescription>
                </div>
                <span className="rounded-full border border-[rgba(var(--color-border),0.5)] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary))]">
                  {group.items.length} registro{group.items.length > 1 ? 's' : ''}
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.items.map((entry) => {
                  const moodInfo = moodByValue[entry.mood];
                  const hydrationInfo = hydrationByValue[entry.hydration];
                  const mealInfo = mealByValue[entry.meals];
                  return (
                    <article
                      key={entry.id}
                      className="space-y-3 rounded-2xl border border-dashed border-[rgba(var(--color-border),0.45)] bg-[rgba(var(--color-surface),0.98)] p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[rgba(var(--color-text),0.55)]">
                        <span className="rounded-full border border-[rgba(var(--color-border),0.5)] px-2 py-1 font-semibold text-[rgb(var(--color-primary))]">
                          {dayjs(entry.createdAt).format('HH:mm')}
                        </span>
                        <span>Registro marcado</span>
                      </div>

                      <div className="space-y-3 text-sm text-[rgba(var(--color-text),0.7)]">
                        <ChecklistRow
                          active={Boolean(moodInfo)}
                          label={moodInfo?.label ?? 'Humor nao informado'}
                          description={
                            moodInfo?.summary ?? 'Selecione um humor predominante nos proximos registros.'
                          }
                        />
                        <ChecklistRow
                          active={Boolean(hydrationInfo)}
                          label={hydrationInfo?.label ?? 'Hidratacao nao informada'}
                          description={hydrationInfo?.summary ?? 'Informe se a crianca bebeu liquidos suficientes.'}
                        />
                        <ChecklistRow
                          active={Boolean(mealInfo)}
                          label={mealInfo?.label ?? 'Alimentacao nao informada'}
                          description={mealInfo?.summary ?? 'Registre como foi o apetite nas proximas anotacoes.'}
                        />
                      </div>

                      <div className="rounded-xl border border-dashed border-[rgba(var(--color-border),0.4)] bg-[rgba(var(--color-surface),0.2)] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(var(--color-text),0.55)]">Anotacoes compartilhadas</p>
                        {entry.notes ? (
                          <p className="mt-1 text-sm text-[rgb(var(--color-text))]">{entry.notes}</p>
                        ) : (
                          <p className="mt-1 text-sm text-[rgba(var(--color-text),0.5)]">Espaco reservado para recados e combinados.</p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </section>
  );
}

type SummaryItemProps = {
  title: string;
  value: string;
  subtitle?: string;
};

function SummaryItem({ title, value, subtitle }: SummaryItemProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[rgba(var(--color-border),0.45)] bg-[rgba(var(--color-surface),0.95)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(var(--color-text),0.55)]">{title}</p>
      <p className="mt-2 text-xl font-semibold text-[rgb(var(--color-text))]">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-[rgba(var(--color-text),0.6)]">{subtitle}</p> : null}
    </div>
  );
}

type TrendPoint = {
  label: string;
  value: number;
  description: string;
};

type TrendCardProps = {
  title: string;
  current: string;
  trend: TrendPoint[];
  scaleMax: number;
  emptyMessage: string;
};

function TrendCard({ title, current, trend, scaleMax, emptyMessage }: TrendCardProps) {
  const hasData = trend.length > 0;
  const recentBadges = hasData ? trend.slice(-4) : [];
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[rgba(var(--color-border),0.45)] bg-[rgba(var(--color-surface),0.95)] p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(var(--color-text),0.55)]">{title}</p>
        <p className="text-sm text-[rgba(var(--color-text),0.7)]">{current}</p>
      </div>
      <div className="h-24">
        {hasData ? (
          <TrendSparkline points={trend} scaleMax={scaleMax} />
        ) : (
          <p className="text-xs text-[rgba(var(--color-text),0.55)]">{emptyMessage}</p>
        )}
      </div>
      {hasData ? (
        <div className="flex flex-wrap gap-2 text-xs text-[rgba(var(--color-text),0.6)]">
          {recentBadges.map((item, index) => (
            <span key={`${item.label}-${item.description}-${index}`} className="rounded-full border border-[rgba(var(--color-border),0.4)] px-2 py-1">
              <span className="font-semibold text-[rgb(var(--color-text))]">{item.label}</span> <span>{item.description}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type TrendSparklineProps = {
  points: TrendPoint[];
  scaleMax: number;
};

function TrendSparkline({ points, scaleMax }: TrendSparklineProps) {
  if (!points.length) {
    return null;
  }

  const width = 220;
  const height = 80;
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const gradientId = `trend-gradient-${points
    .map((point) => point.label.replace(/[^a-zA-Z0-9]/g, ''))
    .join('') || 'default'}`;

  const coordinates = points.map((point, index) => {
    const x = index * step;
    const clampedValue = Math.min(Math.max(point.value, 0), scaleMax);
    const y = height - (clampedValue / scaleMax) * height;
    return `${x},${y}`;
  });
  const lastX = points.length > 1 ? (points.length - 1) * step : 0;

  return (
    <svg role="img" aria-label="Historico dos registros" width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(var(--color-primary),0.55)" />
          <stop offset="100%" stopColor="rgba(var(--color-primary),0.05)" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={`rgb(var(--color-primary))`}
        strokeWidth={2.5}
        points={coordinates.join(' ')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((point, index) => {
        const x = index * step;
        const clampedValue = Math.min(Math.max(point.value, 0), scaleMax);
        const y = height - (clampedValue / scaleMax) * height;
        return (
          <g key={`${point.label}-${index}`}>
            <circle cx={x} cy={y} r={4} fill={`rgb(var(--color-primary))`} />
            <text x={x} y={height + 14} textAnchor="middle" fontSize={10} fill="rgba(var(--color-text),0.6)">
              {point.label}
            </text>
          </g>
        );
      })}
      <polyline
        fill={`url(#${gradientId})`}
        stroke="none"
        points={`0,${height} ${coordinates.join(' ')} ${lastX},${height}`}
        opacity={0.35}
      />
    </svg>
  );
}

type ChecklistRowProps = {
  active: boolean;
  label: string;
  description: string;
};

function ChecklistRow({ active, label, description }: ChecklistRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden
        className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border text-[10px] font-semibold ${
          active
            ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-white'
            : 'border-dashed border-[rgba(var(--color-border),0.5)] text-[rgba(var(--color-text),0.5)]'
        }`}
      >
        {active ? 'x' : ''}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[rgb(var(--color-text))]">[{active ? 'x' : ' '}] {label}</p>
        <p className="text-xs text-[rgba(var(--color-text),0.6)]">{description}</p>
      </div>
    </div>
  );
}

function weekDayLabel(dateISO: string) {
  const labels = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'];
  return labels[dayjs(dateISO).day()] ?? '';
}

