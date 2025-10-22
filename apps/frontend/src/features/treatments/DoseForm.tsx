import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { fetchFamilies, createTreatment } from '../../core/api/resources';
import { useEasyMode } from '../../core/hooks/useEasyMode';
import type { Treatment } from '../../core/types/api';

const doseSchema = z.object({
  familyId: z.string().min(1),
  name: z.string().min(1),
  dose: z.string().min(1),
  schedule: z.string().min(1),
  instructions: z.string().optional(),
});

type DoseFormValues = z.infer<typeof doseSchema>;

type DoseFormProps = {
  onCreated?: (treatment: Treatment) => void;
};

export function DoseForm({ onCreated }: DoseFormProps) {
  const { t } = useTranslation();
  const { enabled: easyMode } = useEasyMode();

  const familiesQuery = useQuery({
    queryKey: ['families'],
    queryFn: fetchFamilies,
  });

  const form = useForm<DoseFormValues>({
    resolver: zodResolver(doseSchema),
    defaultValues: {
      familyId: '',
      name: '',
      dose: '',
      schedule: '',
      instructions: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: DoseFormValues) =>
      createTreatment({
        familyId: values.familyId,
        name: values.name,
        dose: values.dose,
        schedule: values.schedule,
        instructions: values.instructions,
      }),
    onSuccess: (treatment) => {
      form.reset();
      onCreated?.(treatment);
    },
  });

  const onSubmit = (values: DoseFormValues) => {
    mutation.mutate(values);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid gap-4 rounded-3xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6 shadow-soft"
    >
      <h3 className="text-2xl font-semibold text-[rgb(var(--color-text))]">
        {t('treatments.doseForm.title')}
      </h3>

      <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
        <span className="font-semibold">{t('family.form.fields.familyName')}</span>
        <Select
          {...form.register('familyId')}
          aria-invalid={!!form.formState.errors.familyId}
          disabled={familiesQuery.isLoading}
        >
          <option value="">{t('common.select')}</option>
          {familiesQuery.data?.map((family) => (
            <option key={family.id} value={family.id}>
              {family.name}
            </option>
          ))}
        </Select>
        <span className="min-h-[1.25rem] text-sm text-[rgb(var(--color-danger))]">
          {form.formState.errors.familyId ? t('validation.required') : ''}
        </span>
      </label>

      <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
        <span className="font-semibold">{t('treatments.doseForm.fields.name')}</span>
        <Input {...form.register('name')} />
        <span className="min-h-[1.25rem] text-sm text-[rgb(var(--color-danger))]">
          {form.formState.errors.name ? t('validation.required') : ''}
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
          <span className="font-semibold">{t('treatments.doseForm.fields.dose')}</span>
          <Input {...form.register('dose')} />
          <span className="min-h-[1.25rem] text-sm text-[rgb(var(--color-danger))]">
            {form.formState.errors.dose ? t('validation.required') : ''}
          </span>
        </label>

        <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
          <span className="font-semibold">{t('treatments.doseForm.fields.schedule')}</span>
          <Input {...form.register('schedule')} placeholder="08:00, 20:00" />
          <span className="min-h-[1.25rem] text-sm text-[rgb(var(--color-danger))]">
            {form.formState.errors.schedule ? t('validation.required') : ''}
          </span>
        </label>
      </div>

      {!easyMode ? (
        <label className="flex flex-col gap-2 text-base text-[rgb(var(--color-text))]">
          <span className="font-semibold">{t('treatments.doseForm.fields.instructions')}</span>
          <Textarea rows={3} {...form.register('instructions')} />
        </label>
      ) : null}

      <Button type="submit" disabled={mutation.isPending}>
        <Plus className="h-5 w-5" aria-hidden />
        {mutation.isPending ? t('common.loading') : t('treatments.doseForm.submit')}
      </Button>
    </form>
  );
}
