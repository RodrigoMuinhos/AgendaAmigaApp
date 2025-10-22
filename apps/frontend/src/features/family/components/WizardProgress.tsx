type WizardProgressProps = {
  steps: string[];
  currentStep: number;
};

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-4 rounded-3xl border border-[rgba(var(--color-border),0.5)] bg-[rgba(var(--color-primary),0.05)] p-4">
      {steps.map((label, index) => {
        const status =
          index < currentStep ? 'completed' : index === currentStep ? 'current' : 'upcoming';

        return (
          <li
            key={label}
            className="flex min-w-[8rem] flex-col items-center gap-2 text-center text-sm font-medium text-[rgb(var(--color-text))]"
            aria-current={status === 'current' ? 'step' : undefined}
          >
            <span
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full border text-base font-semibold transition',
                status === 'completed'
                  ? 'border-transparent bg-[rgb(var(--color-primary))] text-white'
                  : status === 'current'
                    ? 'border-[rgb(var(--color-primary))] bg-[rgba(var(--color-primary),0.15)] text-[rgb(var(--color-primary))]'
                    : 'border-[rgba(var(--color-border),0.6)] bg-[rgb(var(--color-surface))] text-muted',
              ].join(' ')}
            >
              {index + 1}
            </span>
            <span className={status === 'upcoming' ? 'text-muted' : ''}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
