import { useQuery } from '@tanstack/react-query';
import { BellRing } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useEasyMode } from '../../core/hooks/useEasyMode';
import { fetchAlerts } from '../../core/api/resources';
import type { Alert } from '../../core/types/api';

export function AlertsPage() {
  const { t } = useTranslation();
  const { enabled: easyMode } = useEasyMode();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
  });

  const [dismissed, setDismissed] = useState<Record<string, Alert['status']>>({});

  const alerts = (data ?? []).filter((alert) => dismissed[alert.id] !== 'done');
  const pendingCount = alerts.length;
  const totalCount = data?.length ?? 0;

  const handleDone = (id: string) => {
    setDismissed((prev) => ({ ...prev, [id]: 'done' }));
  };

  const handleSnooze = (id: string) => {
    setDismissed((prev) => ({ ...prev, [id]: 'pending' }));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-8">
        <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">
          {t('alerts.title')}
        </h1>
        <p className="text-lg text-muted">{t('alerts.subtitle')}</p>
        {easyMode ? (
          <p className="mt-2 inline-flex rounded-full bg-[rgba(30,136,229,0.15)] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary))]">
            {t('app.easyModeDescription')}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
          <span className="rounded-full bg-[rgba(var(--color-primary),0.12)] px-3 py-1 font-semibold text-[rgb(var(--color-primary))]">
            {t('alerts.count', { pending: pendingCount, total: totalCount })}
          </span>
        </div>
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
      ) : alerts.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[rgb(var(--color-border))] bg-white p-6 text-lg text-muted">
          {t('alerts.empty')}
        </p>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDone={() => handleDone(alert.id)}
              onSnooze={() => handleSnooze(alert.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

type AlertCardProps = {
  alert: Alert;
  onDone: () => void;
  onSnooze: () => void;
};

function AlertCard({ alert, onDone, onSnooze }: AlertCardProps) {
  const { t } = useTranslation();
  const typeLabel = t(`alerts.types.${alert.type}`, alert.type);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-3">
        <BellRing className="h-8 w-8 text-[rgb(var(--color-primary))]" aria-hidden />
        <div>
          <CardTitle>{alert.title}</CardTitle>
          <CardDescription>{alert.description}</CardDescription>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <span className="rounded-full bg-[rgba(var(--color-primary),0.12)] px-2 py-1 font-semibold text-[rgb(var(--color-primary))]">
              {typeLabel}
            </span>
            {alert.dueDate ? (
              <span className="rounded-full bg-[rgba(var(--color-border),0.4)] px-2 py-1 font-semibold">
                {alert.dueDate}
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted">
          {alert.dueDate ? `${alert.dueDate}` : null}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onSnooze}>
            {t('alerts.snooze')}
          </Button>
          <Button variant="primary" size="sm" onClick={onDone}>
            {t('alerts.markDone')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

