import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../core/hooks/useTheme';
import { Button } from './ui/button';

type ThemeToggleProps = {
  variant?: 'default' | 'compact';
};

export function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const isCompact = variant === 'compact';

  return (
    <Button
      type="button"
      variant="secondary"
      size={isCompact ? 'icon' : 'sm'}
      onClick={toggleTheme}
      aria-pressed={isDark}
      title={isDark ? t('app.lightMode') : t('app.darkMode')}
    >
      {isDark ? <Sun className="h-6 w-6" aria-hidden /> : <Moon className="h-6 w-6" aria-hidden />}
      {!isCompact ? (
        <span className="hidden md:inline">
          {isDark ? t('app.lightMode') : t('app.darkMode')}
        </span>
      ) : null}
    </Button>
  );
}
