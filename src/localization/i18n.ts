import * as Localization from 'expo-localization';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    lng: Localization.getLocales()[0]?.languageCode ?? 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
    },
    interpolation: {
      escapeValue: false,
    },
  })
  .catch(() => {});

export default i18n;
