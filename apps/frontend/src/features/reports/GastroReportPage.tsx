import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

type GastroEntry = {
  id: string;
  dateISO: string;
  stoolType: string;
  hydration: 'adequada' | 'moderada' | 'baixa';
  appetite: 'normal' | 'reduzido' | 'alto';
  notes: string;
  createdAt: string;
};

const stoolScale: Array<{ value: string; label: string; summary: string }> = [
  { value: '1', label: 'Tipo 1 — muito seco', summary: 'Muito seco e dificil de eliminar.' },
  { value: '2', label: 'Tipo 2 — cachos secos', summary: 'Formato em "cachos", indica constipacao.' },
  { value: '3', label: 'Tipo 3 — alongado', summary: 'Formato alongado com rachaduras superficiais.' },
  { value: '4', label: 'Tipo 4 — ideal', summary: 'Aspecto macio e liso, considerado ideal.' },
  { value: '5', label: 'Tipo 5 — fragmentos', summary: 'Fragmentos macios, tende a leve diarreia.' },
  { value: '6', label: 'Tipo 6 — pastoso', summary: 'Pedacos pastosos, diarreia leve.' },
  { value: '7', label: 'Tipo 7 — liquido', summary: 'Muito liquido, indica diarreia aguda.' },
] as const;

const hydrationLevels: Record<GastroEntry['hydration'], { label: string; summary: string }> = {
  adequada: {
    label: 'Hidratacao adequada',
    summary: 'Consumo alinhado a meta diaria.',
  },
  moderada: {
    label: 'Hidratacao moderada',
    summary: 'Monitorar oferta de agua ao longo do dia.',
  },
  baixa: {
    label: 'Hidratacao baixa',
    summary: 'Reforcar ingestao de liquidos imediatamente.',
  },
};

const appetiteLevels: Record<GastroEntry['appetite'], string> = {
  normal: 'Apetite habitual.',
  reduzido: 'Refeicoes incompletas ou recusadas.',
  alto: 'Acima do esperado — observar padroes.',
};

const initialEntries: GastroEntry[] = [
  {
    id: 'entry-1',
    dateISO: dayjs().format('YYYY-MM-DD'),
    stoolType: '4',
    hydration: 'adequada',
    appetite: 'normal',
    notes: 'Almoço completo, sem desconfortos relatados.',
    createdAt: dayjs().subtract(2, 'hour').toISOString(),
  },
  {
    id: 'entry-2',
    dateISO: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    stoolType: '3',
    hydration: 'moderada',
    appetite: 'normal',
    notes: 'Lanche da tarde com frutas; leve dor abdominal ao anoitecer.',
    createdAt: dayjs().subtract(1, 'day').hour(20).toISOString(),
  },
  {
    id: 'entry-3',
    dateISO: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    stoolType: '6',
    hydration: 'baixa',
    appetite: 'reduzido',
    notes: 'Diarreia leve pela manhã. Oferecido soro caseiro.',
    createdAt: dayjs().subtract(2, 'day').hour(9).toISOString(),
  },
] satisfies GastroEntry[];

export function GastroReportPage() {
  const today = dayjs().format('YYYY-MM-DD');

  const [entries, setEntries] = useState<GastroEntry[]>(initialEntries);
  const [entryDate, setEntryDate] = useState<string>(today);
  const [stoolType, setStoolType] = useState<string>('4');
  const [hydration, setHydration] = useState<GastroEntry['hydration']>('adequada');
  const [appetite, setAppetite] = useState<GastroEntry['appetite']>('normal');
  const [notes, setNotes] = useState<string>('');

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (a, b) => dayjs(b.dateISO).valueOf() - dayjs(a.dateISO).valueOf() || dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
      ),
    [entries],
  );

  const groupedEntries = useMemo(() => {
    const map = new Map<string, GastroEntry[]>();
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

  const todayEntries = useMemo(() => sortedEntries.filter((entry) => entry.dateISO === today), [sortedEntries, today]);
  const lastEntry = sortedEntries[0];

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!notes.trim() && !stoolType) {
      return;
    }

    const newEntry: GastroEntry = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
      dateISO: entryDate,
      stoolType,
      hydration,
      appetite,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setEntryDate(today);
    setStoolType('4');
    setHydration('adequada');
    setAppetite('normal');
    setNotes('');
  };

  return (
    <section className="mx-auto w-full max-w-4xl space-y-8 px-2 sm:px-0">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">Relatorio Gastrointestinal</h1>
        <p className="text-base text-[rgba(var(--color-text),0.75)]">
          Registre eliminacoes, hidratacao e observacoes para gerar um acompanhamento diario da crianca.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Guia rapido de acompanhamento</CardTitle>
          <CardDescription>Rotina pensada para interpretar sinais gastrointestinais com claridade.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-[rgba(var(--color-text),0.75)]">
            <li>Registre tipo de fezes pela escala de Bristol para avaliar constipacao ou diarreia.</li>
            <li>Monitore hidratacao com base no consumo de agua, sopas ou solucoes de reidratacao.</li>
            <li>Observe apetite e desconfortos para cruzar dados com rotinas alimentares e emocionais.</li>
            <li>Use as notas para registrar alimentos novos, medicamentos ou mudancas na rotina.</li>
          </ul>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Resumo diario</CardTitle>
        <CardDescription>Visao automatica conforme os registros adicionados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryItem title="Registros de hoje" value={todayEntries.length.toString()} subtitle="Inclui horarios e observacoes." />
          <SummaryItem
            title="Ultima evacuacao"
            value={lastEntry ? dayjs(lastEntry.createdAt).format('DD/MM HH:mm') : 'Sem dados'}
            subtitle={lastEntry ? stoolScale.find((item) => item.value === lastEntry.stoolType)?.summary ?? '' : ''}
          />
          <SummaryItem
            title="Hidratacao"
            value={todayEntries[0] ? hydrationLevels[todayEntries[0].hydration].label : 'Sem registros'}
            subtitle={todayEntries[0] ? hydrationLevels[todayEntries[0].hydration].summary : 'Adicione um registro para atualizar.'}
          />
          <SummaryItem
            title="Apetite"
            value={todayEntries[0] ? appetiteLevels[todayEntries[0].appetite] : 'Sem registros'}
            subtitle="Avalie aceitação dos alimentos principais."
          />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Novo registro diario</CardTitle>
        <CardDescription>Preencha os campos principais para gerar o relatorio automaticamente.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[150px_1fr_1fr]">
          <label className="flex flex-col text-sm font-medium text-[rgba(var(--color-text),0.75)]">
            Data
            <input
              type="date"
              value={entryDate}
              max={today}
              onChange={(event) => setEntryDate(event.target.value)}
              className="mt-1 rounded-xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm text-[rgb(var(--color-text))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)]"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-[rgba(var(--color-text),0.75)]">
            Tipo de evacuacao
            <select
              value={stoolType}
              onChange={(event) => setStoolType(event.target.value)}
              className="mt-1 rounded-xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm text-[rgb(var(--color-text))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)]"
            >
              {stoolScale.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <label className="flex flex-col text-sm font-medium text-[rgba(var(--color-text),0.75)]">
              Hidratacao
              <select
                value={hydration}
                onChange={(event) => setHydration(event.target.value as GastroEntry['hydration'])}
                className="mt-1 rounded-xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm text-[rgb(var(--color-text))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)]"
              >
                <option value="adequada">Adequada</option>
                <option value="moderada">Moderada</option>
                <option value="baixa">Baixa</option>
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium text-[rgba(var(--color-text),0.75)]">
              Apetite
              <select
                value={appetite}
                onChange={(event) => setAppetite(event.target.value as GastroEntry['appetite'])}
                className="mt-1 rounded-xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm text-[rgb(var(--color-text))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)]"
              >
                <option value="normal">Normal</option>
                <option value="reduzido">Reduzido</option>
                <option value="alto">Elevado</option>
              </select>
            </label>
          </div>

          <label className="lg:col-span-3 flex flex-col text-sm font-medium text-[rgba(var(--color-text),0.75)]">
            Observacoes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Registre desconfortos, alimentos diferentes ou orientacoes do pediatra."
              className="mt-1 resize-none rounded-2xl border border-[rgba(var(--color-border),0.6)] bg-white px-3 py-2 text-sm text-[rgb(var(--color-text))] shadow-sm focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--color-primary),0.2)]"
            />
          </label>

          <div className="lg:col-span-3 flex justify-end">
            <Button type="submit" size="sm" className="rounded-full px-5">
              Salvar registro
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <section className="space-y-4">
      {groupedEntries.length === 0 ? (
        <Card className="border border-dashed border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.4)]">
          <CardContent className="py-10 text-center">
            <p className="text-base font-semibold text-[rgb(var(--color-text))]">Sem registros ainda.</p>
            <p className="text-sm text-[rgba(var(--color-text),0.7)]">
              Utilize o formulario acima para iniciar o acompanhamento gastrointestional diario.
            </p>
          </CardContent>
        </Card>
      ) : (
        groupedEntries.map((group) => (
          <Card key={group.dateISO}>
            <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg text-[rgb(var(--color-text))]">{dayjs(group.dateISO).format('DD/MM/YYYY')}</CardTitle>
                <CardDescription className="text-sm text-[rgba(var(--color-text),0.65)]">
                  {dayjs(group.dateISO).isSame(dayjs(), 'day') ? 'Hoje' : weekDayLabel(group.dateISO)}
                </CardDescription>
              </div>
              <span className="rounded-full bg-[rgba(var(--color-primary),0.12)] px-3 py-1 text-xs font-semibold text-[rgb(var(--color-primary))]">
                {group.items.length} registro{group.items.length > 1 ? 's' : ''}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.map((entry) => {
                const scale = stoolScale.find((item) => item.value === entry.stoolType);
                return (
                  <article
                    key={entry.id}
                    className="rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.85)] px-4 py-3 text-sm text-[rgb(var(--color-text))]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[rgba(var(--color-primary),0.12)] px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--color-primary))]">
                        {scale?.label ?? 'Tipo desconhecido'}
                      </span>
                      <span className="text-xs text-[rgba(var(--color-text),0.6)]">Registrado às {dayjs(entry.createdAt).format('HH:mm')}</span>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-4 text-xs text-[rgba(var(--color-text),0.7)]">
                      <li>
                        <strong className="text-[rgb(var(--color-text))]">Consistencia:</strong> {scale?.summary ?? ''}
                      </li>
                      <li>
                        <strong className="text-[rgb(var(--color-text))]">Hidratacao:</strong> {hydrationLevels[entry.hydration].label}
                      </li>
                      <li>
                        <strong className="text-[rgb(var(--color-text))]">Apetite:</strong> {appetiteLevels[entry.appetite]}
                      </li>
                    </ul>
                    {entry.notes ? (
                      <p className="mt-2 text-sm leading-relaxed text-[rgba(var(--color-text),0.85)]">{entry.notes}</p>
                    ) : null}
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
    <div className="rounded-2xl border border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-surface),0.85)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[rgba(var(--color-text),0.6)]">{title}</p>
      <p className="mt-2 text-xl font-semibold text-[rgb(var(--color-text))]">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-[rgba(var(--color-text),0.6)]">{subtitle}</p> : null}
    </div>
  );
}

function weekDayLabel(dateISO: string) {
  const labels = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'];
  return labels[dayjs(dateISO).day()] ?? '';
}
