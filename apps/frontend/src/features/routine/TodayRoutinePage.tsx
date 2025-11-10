import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useEasyMode } from '../../core/hooks/useEasyMode';
import { fetchTodayRoutine } from '../../core/api/resources';
import { asArray, safeFilter } from '../../core/utils/arrays';
import type { RoutineItem } from '../../core/types/api';

export function TodayRoutinePage() {
  const { t } = useTranslation();
  const { enabled: easyMode } = useEasyMode();
  const date = dayjs().format('YYYY-MM-DD');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['routine', date],
    queryFn: () => fetchTodayRoutine(date),
  });

  const routine = asArray<RoutineItem>(data);
  const [completed, setCompleted] = useState<string[]>([]);

  const defaults = useMemo(
    () => safeFilter<RoutineItem>(routine, (item) => item.done).map((item) => item.id),
    [routine],
  );

  useEffect(() => {
    setCompleted(defaults);
  }, [defaults]);

  const toggleItem = (id: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const total = routine.length;
  const completedCount = completed.length;
  const allDone = total > 0 && completedCount === total;

  const handleToggleAll = () => {
    if (allDone) {
      setCompleted([]);
      return;
    }
    setCompleted(routine.map((item) => item.id));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-8">
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">
          {t('routine.todayTitle')}
        </h1>
        <p className="text-lg text-muted">{t('routine.subtitle')}</p>
        {easyMode ? (
          <p className="mt-2 inline-flex rounded-full bg-[rgba(30,136,229,0.15)] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary))]">
            {t('app.easyModeDescription')}
          </p>
        ) : null}
        {total > 0 ? (
          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.7)] px-4 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-[rgb(var(--color-text))]">
              {t('routine.progress', { completed: completedCount, total })}
            </span>
            <Button variant="secondary" size="sm" onClick={handleToggleAll}>
              {allDone ? t('routine.resetAll') : t('routine.markAll')}
            </Button>
          </div>
        ) : null}
      </header>

      {isError ? (
        <div className="rounded-3xl border border-[rgba(var(--color-danger),0.5)] bg-[rgba(var(--color-danger),0.08)] p-6 text-[rgb(var(--color-danger))]">
          <p>{t('common.error')}</p>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-lg text-muted">{t('common.loading')}</p>
      ) : routine.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.7)] p-6 text-lg text-muted">
          {t('routine.empty')}
        </p>
      ) : (
        <div className="grid gap-4">
          {routine.map((item) => (
            <RoutineCard
              key={item.id}
              item={item}
              done={completed.includes(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type RoutineCardProps = {
  item: RoutineItem;
  done: boolean;
  onToggle: () => void;
};

function RoutineCard({ item, done, onToggle }: RoutineCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={[
        'transition',
        done ? 'border-[rgb(var(--color-primary))] bg-[rgba(30,136,229,0.05)]' : '',
      ].join(' ')}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-2xl">
          {item.title}
        </CardTitle>
        <Checkbox
          checked={done}
          onChange={(event) => {
            event.preventDefault();
            onToggle();
          }}
          aria-label={t('routine.complete')}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-base text-muted">{item.description}</p>
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text))]">
          <CheckCircle2
            className={[
              'h-6 w-6',
              done ? 'text-[rgb(var(--color-primary))]' : 'text-muted',
            ].join(' ')}
            aria-hidden
          />
          <span>{item.scheduledAt}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={onToggle}>
          {done ? t('common.cancel') : t('routine.complete')}
        </Button>
      </CardContent>
    </Card>
  );
}
