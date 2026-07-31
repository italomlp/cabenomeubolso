export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const localizationResources = {
  en: {
    translation: {
      app: {
        readyBody: 'Router, SQLite, and preferences are initialized.',
        readyTitle: 'Expo foundation ready',
        loading: 'Loading app shell…',
        error: 'Unable to start the app shell.',
      },
      preferences: {
        currencyBrl: 'Brazilian real',
        currencySystem: 'System',
        currencyUsd: 'US dollar',
        languageSystem: 'System',
      },
    },
  },
  'pt-BR': {
    translation: {
      app: {
        readyBody: 'Router, SQLite e preferências estão inicializados.',
        readyTitle: 'Base do Expo pronta',
        loading: 'Carregando a base do app…',
        error: 'Não foi possível iniciar a base do app.',
      },
      preferences: {
        currencyBrl: 'real brasileiro',
        currencySystem: 'Sistema',
        currencyUsd: 'dólar americano',
        languageSystem: 'Sistema',
      },
    },
  },
} as const;
