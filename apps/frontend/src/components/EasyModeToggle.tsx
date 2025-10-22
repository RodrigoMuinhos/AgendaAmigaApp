import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { useEasyMode } from '../core/hooks/useEasyMode';
import { Switch } from './ui/switch';
import { Button } from './ui/button';

type EasyModeToggleProps = {
  variant?: 'default' | 'compact';
};

export function EasyModeToggle({ variant = 'default' }: EasyModeToggleProps) {
  const { t } = useTranslation();
  const { enabled, toggle } = useEasyMode();
  const id = useId();
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={toggle}
        aria-pressed={enabled}
        title={t('app.easyMode')}
        aria-label={t('app.easyMode')}
      >
        <Sparkles className="h-5 w-5" aria-hidden />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-base font-semibold text-[rgb(var(--color-text))]">
        {t('app.easyMode')}
      </span>
      <Switch id={id} checked={enabled} onCheckedChange={toggle} aria-describedby={`${id}-hint`} />
      <span id={`${id}-hint`} className="hidden text-sm text-muted md:inline">
        {t('app.easyModeDescription')}
      </span>
    </div>
  );
}
