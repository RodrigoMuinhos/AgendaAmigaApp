import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { fetchFamilies, fetchTodayRoutine, fetchTreatments } from '../../core/api/resources';
import type { Family, RoutineItem, Treatment } from '../../core/types/api';

export function QuickStats() {
  const { t } = useTranslation();

  const date = dayjs().format('YYYY-MM-DD');

  const familiesQuery = useQuery({
    queryKey: ['families'],
    queryFn: fetchFamilies,
  });

  const treatmentsQuery = useQuery({
    queryKey: ['treatments'],
    queryFn: fetchTreatments,
  });

  const routineQuery = useQuery({
    queryKey: ['routine', date],
    queryFn: () => fetchTodayRoutine(date),
  });

  const isLoading = familiesQuery.isLoading || treatmentsQuery.isLoading || routineQuery.isLoading;
  const hasError = familiesQuery.isError || treatmentsQuery.isError || routineQuery.isError;

  const families = familiesQuery.data ?? [];
  const routine = routineQuery.data ?? [];

  const doseCount = countDoses(routine);
  const shareCount = countShares(families);

  return (
    <section
      aria-live="polite"
      className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-10"
    >
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-[rgb(var(--color-text))]">
          {t('home.quickStats.title')}
        </h2>

        {hasError ? (
          <div className="rounded-3xl border border-[rgba(var(--color-danger),0.4)] bg-[rgba(var(--color-danger),0.08)] px-4 py-3 text-sm text-[rgb(var(--color-danger))] shadow-soft">
            <p>{t('common.error')}</p>
            <button
              type="button"
              onClick={() => {
                void familiesQuery.refetch();
                void treatmentsQuery.refetch();
                void routineQuery.refetch();
              }}
              className="mt-3 w-fit rounded-full border border-[rgba(var(--color-primary),0.5)] bg-[rgba(var(--color-primary),0.12)] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary))] transition hover:bg-[rgba(var(--color-primary),0.2)]"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-lg text-muted">{t('common.loading')}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            <StatBlock
              label={t('home.quickStats.families', { count: families.length })}
              highlight={families.length}
            />
            <StatBlock label={t('home.quickStats.doses', { count: doseCount })} highlight={doseCount} />
            <StatBlock
              label={t('home.quickStats.shares', { count: shareCount })}
              highlight={shareCount}
            />
          </div>
        )}

        {!isLoading && !hasError && families.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.7)] p-4 text-lg text-muted">
            {t('home.quickStats.empty')}
          </p>
        ) : null}
      </div>
    </section>
  );
}

type StatBlockProps = {
  label: string;
  highlight: number;
};

function StatBlock({ label, highlight }: StatBlockProps) {
  return (
    <div className="rounded-2xl bg-[rgba(30,136,229,0.08)] p-4 text-center">
      <span className="block text-4xl font-bold text-[rgb(var(--color-primary))]">{highlight}</span>
      <span className="text-lg font-semibold text-[rgb(var(--color-text))]">{label}</span>
    </div>
  );
}

function countShares(families: Family[]) {
  return families.reduce((acc, family) => acc + (family.caregivers?.length ?? 0), 0);
}

function countDoses(routine: RoutineItem[]) {
  return routine.filter((task) => task.category === 'dose').length || routine.length;
}
