import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pill } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DoseForm } from './DoseForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useEasyMode } from '../../core/hooks/useEasyMode';
import { fetchTreatments } from '../../core/api/resources';
import { asArray } from '../../core/utils/arrays';
import type { Treatment } from '../../core/types/api';

export function TreatmentListPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { enabled: easyMode } = useEasyMode();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['treatments'],
    queryFn: fetchTreatments,
  });

  const treatments = asArray<Treatment>(data);

  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['treatments'] }).catch(() => undefined);
  };

  return (
    <section className="space-y-8">
      <header className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-8">
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">
          {t('treatments.title')}
        </h1>
        <p className="text-lg text-muted">{t('treatments.subtitle')}</p>
        {easyMode ? (
          <p className="mt-2 inline-flex rounded-full bg-[rgba(30,136,229,0.15)] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary))]">
            {t('app.easyModeDescription')}
          </p>
        ) : null}
      </header>

      <DoseForm onCreated={handleCreated} />

      {isError ? (
        <div className="rounded-3xl border border-[rgba(var(--color-danger),0.5)] bg-[rgba(var(--color-danger),0.08)] p-6 text-[rgb(var(--color-danger))]">
          <p>{t('common.error')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-base font-semibold text-[rgb(var(--color-primary))]"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-lg text-muted">{t('common.loading')}</p>
      ) : treatments.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[rgba(var(--color-border),0.6)] bg-[rgba(var(--color-surface),0.7)] p-6 text-lg text-muted">
          {t('treatments.empty')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {treatments.map((treatment) => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))}
        </div>
      )}
    </section>
  );
}

type TreatmentCardProps = {
  treatment: Treatment;
};

function TreatmentCard({ treatment }: TreatmentCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Pill className="h-8 w-8 text-[rgb(var(--color-primary))]" aria-hidden />
          <CardTitle>{treatment.name}</CardTitle>
        </div>
        <CardDescription>
          {t('treatments.list.doseCount', { count: treatment.doses?.length ?? 1 })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-base text-[rgb(var(--color-text))]">
        <p>
          <strong>{t('treatments.doseForm.fields.dose')}:</strong> {treatment.dose}
        </p>
        <p>
          <strong>{t('treatments.doseForm.fields.schedule')}:</strong> {treatment.schedule}
        </p>
        {treatment.nextDose ? (
          <p className="text-sm text-muted">
            {t('treatments.list.nextDose', { time: treatment.nextDose })}
          </p>
        ) : null}
        {treatment.instructions ? (
          <p className="text-sm text-muted">{treatment.instructions}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}


