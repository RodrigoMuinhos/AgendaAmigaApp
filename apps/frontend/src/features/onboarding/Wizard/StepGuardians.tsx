import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/FormField';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import type { StepProps } from './types';

export function StepGuardians({ form, easyMode }: StepProps) {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const inviteMessage = watch('whatsAppInvite');
  const caregiverName = watch('caregiverName');
  const caregiverPhone = watch('caregiverPhone');

  const whatsAppLink = useMemo(() => {
    const base = 'https://wa.me/';
    const phone = caregiverPhone?.replace(/\D/g, '') ?? '';
    const text =
      inviteMessage ||
      `${t('app.name')} - ${caregiverName ?? ''} convida você para cuidar em conjunto.`;
    if (!phone) {
      return null;
    }
    return `${base}${phone}?text=${encodeURIComponent(text)}`;
  }, [caregiverName, caregiverPhone, inviteMessage, t]);

  return (
    <div className="grid gap-6">
      <FormField
        label={t('onboarding.steps.guardians.fields.primaryGuardian')}
        htmlFor="primaryGuardian"
        required
        error={errors.primaryGuardian ? t('validation.required') : undefined}
      >
        <Input id="primaryGuardian" {...register('primaryGuardian')} />
      </FormField>

      {!easyMode ? (
        <FormField
          label={t('onboarding.steps.guardians.fields.backupGuardian')}
          htmlFor="backupGuardian"
          error={errors.backupGuardian ? t('validation.required') : undefined}
        >
          <Input id="backupGuardian" {...register('backupGuardian')} />
        </FormField>
      ) : null}

      <FormField
        label={t('onboarding.steps.guardians.fields.emergencyPhone')}
        htmlFor="emergencyPhone"
        required
        error={errors.emergencyPhone ? t('validation.required') : undefined}
      >
        <Input id="emergencyPhone" {...register('emergencyPhone')} inputMode="tel" />
      </FormField>

      <FormField
        label={t('onboarding.steps.guardians.fields.whatsAppInvite')}
        htmlFor="whatsAppInvite"
        error={errors.whatsAppInvite ? t('validation.required') : undefined}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            id="whatsAppInvite"
            {...register('whatsAppInvite')}
            placeholder="Oi! Vamos cuidar juntos com a Agenda Amiga."
          />
          {whatsAppLink ? (
            <Button asChild variant="primary" size="sm" className="whitespace-nowrap">
              <a href={whatsAppLink} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </Button>
          ) : null}
        </div>
      </FormField>
    </div>
  );
}

