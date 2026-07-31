import { describe, expect, it } from '@jest/globals';

import { i18n } from './i18n';

describe('i18n bundle', () => {
  it('serves bundled pt-BR and en resources at runtime', async () => {
    await i18n.changeLanguage('pt-BR');

    expect(i18n.t('app.readyTitle')).toBe('Base do Expo pronta');
    expect(i18n.t('preferences.currencyUsd')).toBe('dólar americano');
    expect(i18n.t('app.loading')).toBe('Carregando a base do app…');

    await i18n.changeLanguage('en');

    expect(i18n.t('app.readyTitle')).toBe('Expo foundation ready');
    expect(i18n.t('preferences.currencyUsd')).toBe('US dollar');
    expect(i18n.t('app.error')).toBe('Unable to start the app shell.');
  });
});
