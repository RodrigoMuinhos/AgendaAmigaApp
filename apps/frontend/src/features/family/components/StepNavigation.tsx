import type { TFunction } from 'i18next';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';

type StepNavigationProps = {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  t: TFunction;
};

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  isSubmitting,
  isLastStep,
  t,
}: StepNavigationProps) {
  const stepLabel = `${currentStep + 1}/${totalSteps}`;

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={currentStep === 0}
        aria-label={t('common.back', 'Voltar')}
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </Button>

      <span className="text-sm font-semibold text-muted">{stepLabel}</span>

      <Button
        type={isLastStep ? 'submit' : 'button'}
        size="icon"
        onClick={isLastStep ? undefined : onNext}
        disabled={isSubmitting}
        aria-label={isLastStep ? t('common.finish', 'Concluir') : t('common.next', 'Avancar')}
      >
        {isLastStep ? <Check className="h-5 w-5" aria-hidden /> : <ArrowRight className="h-5 w-5" aria-hidden />}
      </Button>
    </div>
  );
}
