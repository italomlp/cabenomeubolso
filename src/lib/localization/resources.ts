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
        designPreviewBody: 'Semantic tokens, adapters, and theme resolution are wired up.',
        designPreviewTitle: 'Design system preview',
      },
      form: {
        currencyLabel: 'Currency',
        searchHelper: 'Styled by semantic tokens, not screen colors.',
        searchLabel: 'Search',
        searchPlaceholder: 'Budget groceries',
        openSheet: 'Open sheet',
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
        designPreviewBody: 'Tokens semânticos, adapters e resolução de tema já estão conectados.',
        designPreviewTitle: 'Prévia do design system',
      },
      form: {
        currencyLabel: 'Moeda',
        searchHelper: 'Estilizado por tokens semânticos, não por cores da tela.',
        searchLabel: 'Buscar',
        searchPlaceholder: 'Mantimentos do orçamento',
        openSheet: 'Abrir painel',
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
