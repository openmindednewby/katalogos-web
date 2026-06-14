import * as Localization from 'expo-localization';

import { initI18n } from '@dloizides/frontend-devtools';

import en from './locales/en.json';

const i18n = initI18n({
  resources: { en: { translation: en } },
  lng: Localization.getLocales()[0]?.languageCode ?? 'en',
});

export default i18n;
