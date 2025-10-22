import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { VoiceButton } from '../../../components/VoiceButton';
import { Button } from '../../../components/ui/button';
import { useEasyMode } from '../../../core/hooks/useEasyMode';
import { useLocalStorage } from '../../../core/hooks/useLocalStorage';
import type { OnboardingDraft } from '../../../core/types/api';
import { StepBasics } from './StepBasics';
import { StepFiles } from './StepFiles';
import { StepGuardians } from './StepGuardians';
import { StepHealth } from './StepHealth';
import { StepRoutine } from './StepRoutine';
import { StepWho } from './StepWho';
import type { StepProps } from './types';

const onboardingSchema = z.object({
  caregiverName: z.string().min(1),
  caregiverRelation: z.string().optional(),
  caregiverPhone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato: (00) 00000-0000'),
  personName: z.string().min(1),
  birthdate: z.string().min(1),
  document: z.string().optional(),
  address: z.string().optional(),
  conditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  supports: z.string().optional(),
  primaryGuardian: z.string().min(1),
  backupGuardian: z.string().optional(),
  emergencyPhone: z.string().min(8),
  whatsAppInvite: z.string().optional(),
  wakeTime: z.string().optional(),
  sleepTime: z.string().optional(),
  meals: z.string().optional(),
  medicationName: z.string().min(1),
  medicationDose: z.string().min(1),
  medicationSchedule: z.string().min(1),
  documents: z.string().optional(),
  notes: z.string().optional(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const defaultValues: OnboardingFormValues = {
  caregiverName: '',
  caregiverRelation: '',
  caregiverPhone: '',
  personName: '',
  birthdate: '',
  document: '',
  address: '',
  conditions: '',
  allergies: '',
  medications: '',
  supports: '',
  primaryGuardian: '',
  backupGuardian: '',
  emergencyPhone: '',
  whatsAppInvite: '',
  wakeTime: '',
  sleepTime: '',
  meals: '',
  medicationName: '',
  medicationDose: '',
  medicationSchedule: '',
  documents: '',
  notes: '',
};

const steps: Array<{
  id: keyof typeof stepComponents;
  titleKey: string;
  descriptionKey: string;
  fields: Array<keyof OnboardingFormValues>;
}> = [
  {
    id: 'who',
    titleKey: 'onboarding.steps.who.title',
    descriptionKey: 'onboarding.steps.who.description',
    fields: ['caregiverName', 'caregiverRelation', 'caregiverPhone'],
  },
  {
    id: 'basics',
    titleKey: 'onboarding.steps.basics.title',
    descriptionKey: 'onboarding.steps.basics.description',
    fields: ['personName', 'birthdate', 'document', 'address'],
  },
  {
    id: 'health',
    titleKey: 'onboarding.steps.health.title',
    descriptionKey: 'onboarding.steps.health.description',
    fields: ['conditions', 'allergies', 'medications', 'supports'],
  },
  {
    id: 'guardians',
    titleKey: 'onboarding.steps.guardians.title',
    descriptionKey: 'onboarding.steps.guardians.description',
    fields: ['primaryGuardian', 'backupGuardian', 'emergencyPhone', 'whatsAppInvite'],
  },
  {
    id: 'routine',
    titleKey: 'onboarding.steps.routine.title',
    descriptionKey: 'onboarding.steps.routine.description',
    fields: [
      'wakeTime',
      'sleepTime',
      'meals',
      'medicationName',
      'medicationDose',
      'medicationSchedule',
    ],
  },
  {
    id: 'files',
    titleKey: 'onboarding.steps.files.title',
    descriptionKey: 'onboarding.steps.files.description',
    fields: ['documents', 'notes'],
  },
];

const stepComponents: Record<
  'who' | 'basics' | 'health' | 'guardians' | 'routine' | 'files',
  (props: StepProps) => JSX.Element
> = {
  who: StepWho,
  basics: StepBasics,
  health: StepHealth,
  guardians: StepGuardians,
  routine: StepRoutine,
  files: StepFiles,
};

export function OnboardingWizard() {
  const { t } = useTranslation();
  const { enabled: easyMode } = useEasyMode();
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { value: storedDraft, setValue: setDraft, clear } = useLocalStorage<OnboardingDraft>(
    'agenda-amiga:onboarding-draft',
    {},
  );

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
    mode: 'onChange',
  });

  const StepComponent = stepComponents[steps[currentStep].id];

  const handleSaveDraft = () => {
    const values = form.getValues();
    setDraft(values);
    setFeedback(t('onboarding.feedback.saved'));
  };

  const handleResumeDraft = () => {
    if (!storedDraft) {
      return;
    }
    form.reset({ ...defaultValues, ...storedDraft });
    setFeedback(t('common.draftLoaded'));
  };

  const handleDiscardDraft = () => {
    clear();
    form.reset(defaultValues);
    setFeedback(t('common.draftCleared'));
  };

  const triggerCurrentStep = async () => {
    const fields = steps[currentStep].fields;
    return form.trigger(fields);
  };

  const goNext = async () => {
    const isValid = await triggerCurrentStep();
    if (!isValid) {
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((index) => index + 1);
    } else {
      form.handleSubmit(handleSubmit)();
    }
  };

  const goPrev = () => {
    if (currentStep === 0) {
      return;
    }
    setCurrentStep((index) => index - 1);
  };

  const handleSubmit = (data: OnboardingFormValues) => {
    setDraft(data);
    setFeedback(t('onboarding.feedback.submitted'));
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[rgb(var(--color-text))]">
              {t('onboarding.title')}
            </h1>
            <p className="text-lg text-muted">{t('onboarding.subtitle')}</p>
          </div>
          <VoiceButton text={t('onboarding.voiceSummary')} label={t('app.voice')} />
        </div>
        {easyMode ? (
          <p className="rounded-2xl bg-[rgba(92,107,79,0.15)] px-4 py-2 text-base font-semibold text-[rgb(var(--color-accent))]">
            {t('app.easyModeDescription')}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={handleSaveDraft}>
            {t('onboarding.saveDraft')}
          </Button>
          {storedDraft && Object.keys(storedDraft).length ? (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={handleResumeDraft}>
                {t('onboarding.resumeDraft')}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleDiscardDraft}>
                {t('onboarding.removeDraft')}
              </Button>
            </>
          ) : null}
        </div>
        {feedback ? (
          <p className="text-base font-semibold text-[rgb(var(--color-primary))]" role="status">
            {feedback}
          </p>
        ) : null}
      </header>

      <nav aria-label={t('onboarding.title')} className="overflow-x-auto">
        <ol className="flex min-w-full items-center justify-center gap-4 py-2">
          {steps.map((step, index) => {
            const status =
              index === currentStep ? 'current' : index < currentStep ? 'complete' : 'upcoming';
            const baseClass =
              'flex h-12 w-12 items-center justify-center rounded-full border text-lg font-semibold transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--color-primary))] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60';
            const statusClass =
              status === 'current'
                ? 'border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-white shadow-elevated'
                : status === 'complete'
                  ? 'border-[rgba(var(--color-primary),0.6)] bg-[rgba(var(--color-primary),0.12)] text-[rgb(var(--color-primary))]'
                  : 'border-[rgba(var(--color-border),0.8)] bg-[rgba(var(--color-surface),0.7)] text-[rgba(var(--color-text),0.7)]';
            return (
              <li key={step.id} className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => (index <= currentStep ? setCurrentStep(index) : null)}
                  disabled={index > currentStep}
                  aria-current={status === 'current' ? 'step' : undefined}
                  aria-label={`${t('onboarding.stepStatus', {
                    current: index + 1,
                    total: steps.length,
                  })} - ${t(step.titleKey)}`}
                  title={`${t('onboarding.stepStatus', {
                    current: index + 1,
                    total: steps.length,
                  })} - ${t(step.titleKey)}`}
                  className={[baseClass, statusClass].join(' ')}
                >
                  <span>{index + 1}</span>
                  <span className="sr-only">
                    {t(step.titleKey)} - {t(step.descriptionKey)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <form className="space-y-6 rounded-3xl bg-[rgb(var(--color-surface))] p-6 shadow-soft lg:p-8">
        <StepComponent form={form} easyMode={easyMode} />

        <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={goPrev} disabled={currentStep === 0}>
            {t('onboarding.actions.back')}
          </Button>
          <Button type="button" onClick={goNext}>
            {currentStep === steps.length - 1
              ? t('onboarding.actions.submit')
              : t('onboarding.actions.next')}
          </Button>
        </footer>
      </form>
    </section>
  );
}
