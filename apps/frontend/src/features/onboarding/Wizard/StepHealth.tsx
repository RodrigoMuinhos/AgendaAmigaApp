import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/FormField';
import { useMemo } from 'react';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import type { StepProps } from './types';

export function StepHealth({ form, easyMode }: StepProps) {
  const conditionOptions = useMemo(() => ([
    'Diabetes',
    'Hipertensão',
    'Doença cardiovascular',
    'Asma',
    'Deficiência física',
    'Deficiência intelectual',
    'Condição rara',
  ]), []);
  const allergyOptions = useMemo(() => ([
    'Medicamentos',
    'Alimentos',
    'Picadas de inseto',
    'Outros',
  ]), []);
  const supportOptions = useMemo(() => ([
    'Cadeira de rodas',
    'Bengala / andador',
    'Próteses',
    'Respirador / oxigênio',
    'Outros',
  ]), []);
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid gap-6">
      {!easyMode ? (
        <FormField
          label={t('onboarding.steps.health.fields.conditions')}
          htmlFor="conditions"
          error={errors.conditions ? t('validation.required') : undefined}
          description={t('onboarding.steps.health.description')}
        >
          <Textarea id="conditions" rows={3} {...register('conditions')} />
        </FormField>
      ) : null}

      <FormField
        label={t('onboarding.steps.health.fields.allergies')}
        htmlFor="allergies"
        error={errors.allergies ? t('validation.required') : undefined}
      >
        <Textarea id="allergies" rows={3} {...register('allergies')} />
      </FormField>

      <FormField
        label={t('onboarding.steps.health.fields.medications')}
        htmlFor="medications"
        required
        error={errors.medications ? t('validation.required') : undefined}
      >
        <Textarea id="medications" rows={3} {...register('medications')} />
      </FormField>

      {!easyMode ? (
        <FormField
          label={t('onboarding.steps.health.fields.supports')}
          htmlFor="supports"
          error={errors.supports ? t('validation.required') : undefined}
        >
          <Textarea id="supports" rows={3} {...register('supports')} />
        </FormField>
      ) : null}
    </div>
  );
}
