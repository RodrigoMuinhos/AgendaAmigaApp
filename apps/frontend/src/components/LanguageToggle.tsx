import { Languages } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../app/i18n';
import { Button } from './ui/button';
import { Select } from './ui/select';

type LanguageToggleProps = {
  variant?: 'default' | 'compact';
};

export function LanguageToggle({ variant = 'default' }: LanguageToggleProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language.startsWith('en') ? 'en' : 'pt';

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(event.target.value as 'pt' | 'en');
  };

  const handleToggle = () => {
    changeLanguage(currentLanguage === 'pt' ? 'en' : 'pt');
  };

  if (variant === 'compact') {
    const nextLanguage = currentLanguage === 'pt' ? t('app.languageEn') : t('app.languagePt');
    return (
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={handleToggle}
        title={`${t('app.language')}: ${nextLanguage}`}
        aria-label={`${t('app.language')}: ${nextLanguage}`}
      >
        <Languages className="h-5 w-5" aria-hidden />
      </Button>
    );
  }

  return (
    <label className="flex items-center gap-2 text-base font-semibold text-[rgb(var(--color-text))]">
      {t('app.language')}
      <Select
        className="w-32"
        aria-label={t('app.language')}
        value={currentLanguage}
        onChange={handleSelectChange}
      >
        <option value="pt">{t('app.languagePt')}</option>
        <option value="en">{t('app.languageEn')}</option>
      </Select>
    </label>
  );
}

