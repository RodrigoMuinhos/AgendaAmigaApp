import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/FormField';
import { Textarea } from '../../../components/ui/textarea';
import type { StepProps } from './types';

export function StepFiles({ form }: StepProps) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid gap-6">
      <FormField
        label={t('onboarding.steps.files.fields.documents')}
        htmlFor="documents"
        error={errors.documents ? t('validation.required') : undefined}
      >
        <Textarea
          id="documents"
          rows={3}
          placeholder="Carteira de vacinação, laudos, receitas..."
          {...register('documents')}
        />
      </FormField>

      <FormField
        label={t('onboarding.steps.files.fields.notes')}
        htmlFor="notes"
        error={errors.notes ? t('validation.required') : undefined}
      >
        <Textarea
          id="notes"
          rows={4}
          placeholder="Informações importantes para o cuidado diário."
          {...register('notes')}
        />
      </FormField>
    </div>
  );
}
