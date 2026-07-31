import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, localizationResources } from './resources';

export const i18n = createInstance();

i18n.use(initReactI18next).init({
  defaultNS: 'translation',
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
  lng: DEFAULT_LANGUAGE,
  resources: localizationResources,
  returnNull: false,
  supportedLngs: [...SUPPORTED_LANGUAGES],
});
