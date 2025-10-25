import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/FormField';
import { Input } from '../../../components/ui/input';
import { MaskedInput } from '../../../components/ui/masked-input';
import type { StepProps } from './types';

export function StepWho({ form, easyMode }: StepProps) {
  const { t } = useTranslation();
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className="grid gap-6">
      <FormField
        label={t('onboarding.steps.who.fields.caregiverName')}
        htmlFor="caregiverName"
        required
        error={errors.caregiverName ? t('validation.required') : undefined}
      >
        <Input id="caregiverName" {...register('caregiverName')} autoComplete="name" />
      </FormField>

      {!easyMode ? (
        <FormField
          label={t('onboarding.steps.who.fields.caregiverRelation')}
          htmlFor="caregiverRelation"
          error={errors.caregiverRelation ? t('validation.required') : undefined}
        >
          <Input id="caregiverRelation" {...register('caregiverRelation')} />
        </FormField>
      ) : null}

      <FormField
        label={t('onboarding.steps.who.fields.caregiverPhone')}
        htmlFor="caregiverPhone"
        required
        error={errors.caregiverPhone ? t('validation.required') : undefined}
      >
        <Controller
          control={control}
          name="caregiverPhone"
          render={({ field }) => (
            <MaskedInput
              mask="(99) 99999-9999"
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
            >
              {(inputProps) => (
                <Input
                  {...inputProps}
                  id="caregiverPhone"
                  ref={field.ref}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(00) 00000-0000"
                />
              )}
            </MaskedInput>
          )}
        />
      </FormField>
    </div>
  );
}
