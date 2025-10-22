import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/FormField';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import type { StepProps } from './types';

export function StepRoutine({ form, easyMode }: StepProps) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid gap-6">
      {!easyMode ? (
        <>
          <FormField
            label={t('onboarding.steps.routine.fields.wakeTime')}
            htmlFor="wakeTime"
            error={errors.wakeTime ? t('validation.required') : undefined}
          >
            <Input id="wakeTime" type="time" {...register('wakeTime')} />
          </FormField>
          <FormField
            label={t('onboarding.steps.routine.fields.sleepTime')}
            htmlFor="sleepTime"
            error={errors.sleepTime ? t('validation.required') : undefined}
          >
            <Input id="sleepTime" type="time" {...register('sleepTime')} />
          </FormField>
          <FormField
            label={t('onboarding.steps.routine.fields.meals')}
            htmlFor="meals"
            error={errors.meals ? t('validation.required') : undefined}
          >
            <Textarea id="meals" rows={3} {...register('meals')} />
          </FormField>
        </>
      ) : null}

      <FormField
        label={t('onboarding.steps.routine.fields.medicationName')}
        htmlFor="medicationName"
        required
        error={errors.medicationName ? t('validation.required') : undefined}
      >
        <Input id="medicationName" {...register('medicationName')} />
      </FormField>

      <FormField
        label={t('onboarding.steps.routine.fields.medicationDose')}
        htmlFor="medicationDose"
        required
        error={errors.medicationDose ? t('validation.required') : undefined}
      >
        <Input id="medicationDose" {...register('medicationDose')} />
      </FormField>

      <FormField
        label={t('onboarding.steps.routine.fields.medicationSchedule')}
        htmlFor="medicationSchedule"
        required
        error={errors.medicationSchedule ? t('validation.required') : undefined}
      >
        <Input id="medicationSchedule" {...register('medicationSchedule')} placeholder="08:00, 12:00, 18:00" />
      </FormField>
    </div>
  );
}
