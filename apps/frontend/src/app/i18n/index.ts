import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import pt from './locales/pt.json';

const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en'],
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('i18n init error', err);
  });

export function changeLanguage(nextLocale: 'pt' | 'en') {
  i18n.changeLanguage(nextLocale).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('i18n change language error', err);
  });
}

export default i18n;
