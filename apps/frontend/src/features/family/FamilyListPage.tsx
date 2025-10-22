import { useQuery } from '@tanstack/react-query';
import { UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useEasyMode } from '../../core/hooks/useEasyMode';
import type { Family } from '../../core/types/api';
import { fetchFamilies } from '../../core/api/resources';

export function FamilyListPage() {
  const { t } = useTranslation();
  const { enabled: easyMode } = useEasyMode();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['families'],
    queryFn: fetchFamilies,
  });

  const families = data ?? [];

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">
            {t('family.title')}
          </h1>
          <p className="text-lg text-muted">{t('family.subtitle')}</p>
          {easyMode ? (
            <p className="rounded-full bg-[rgba(30,136,229,0.15)] px-4 py-2 text-sm font-semibold text-[rgb(var(--color-primary))]">
              {t('app.easyModeDescription')}
            </p>
          ) : null}
        </div>

        <Button asChild><Link to="/family/new">{t('family.create')}</Link></Button>
      </header>

      {isError ? (
        <div className="rounded-3xl border border-[rgba(var(--color-danger),0.5)] bg-[rgba(var(--color-danger),0.08)] p-6 text-[rgb(var(--color-danger))]">
          <p>{t('common.error')}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-lg text-muted">{t('common.loading')}</p>
      ) : families.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6 text-lg text-muted">
          {t('family.empty')}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {families.map((family) => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>
      )}
    </section>
  );
}

type FamilyCardProps = {
  family: Family;
};

function FamilyCard({ family }: FamilyCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <UsersRound className="h-8 w-8 text-[rgb(var(--color-primary))]" aria-hidden />
          <CardTitle>{family.name}</CardTitle>
        </div>
        <CardDescription>
          {family.city}, {family.state}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-base">
          <strong>{t('family.members', { count: family.members.length })}</strong>
        </p>
        <p className="text-base">
          <strong>{t('family.caregivers', { count: family.caregivers.length })}</strong>
        </p>
        {family.primaryCaregiver ? (
          <p className="text-base text-muted">
            {t('family.form.fields.primaryCaregiver')}: {family.primaryCaregiver}
          </p>
        ) : null}
        {family.notes ? <p className="text-base text-muted">{family.notes}</p> : null}
      </CardContent>
    </Card>
  );
}



