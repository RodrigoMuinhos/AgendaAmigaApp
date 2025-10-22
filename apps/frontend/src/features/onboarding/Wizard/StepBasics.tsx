import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/FormField';
import { Input } from '../../../components/ui/input';
import type { StepProps } from './types';

export function StepBasics({ form, easyMode }: StepProps) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid gap-6">
      <FormField
        label={t('onboarding.steps.basics.fields.personName')}
        htmlFor="personName"
        required
        error={errors.personName ? t('validation.required') : undefined}
      >
        <Input id="personName" {...register('personName')} autoComplete="name" />
      </FormField>

      <FormField
        label={t('onboarding.steps.basics.fields.birthdate')}
        htmlFor="birthdate"
        required
        error={errors.birthdate ? t('validation.required') : undefined}
      >
        <Input id="birthdate" type="date" {...register('birthdate')} />
      </FormField>

      {!easyMode ? (
        <>
          <FormField
            label={t('onboarding.steps.basics.fields.document')}
            htmlFor="document"
            error={errors.document ? t('validation.required') : undefined}
          >
            <Input id="document" {...register('document')} autoComplete="off" />
          </FormField>
          <FormField
            label={t('onboarding.steps.basics.fields.address')}
            htmlFor="address"
            error={errors.address ? t('validation.required') : undefined}
          >
            <Input id="address" {...register('address')} autoComplete="street-address" />
          </FormField>
        </>
      ) : null}
    </div>
  );
}
