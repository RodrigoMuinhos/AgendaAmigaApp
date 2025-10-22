import type { UseFormReturn } from 'react-hook-form';
import type { OnboardingFormValues } from './OnboardingWizard';

export type StepProps = {
  form: UseFormReturn<OnboardingFormValues>;
  easyMode: boolean;
};
