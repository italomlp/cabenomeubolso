import { describe, expect, it } from '@jest/globals';

import { i18n } from './i18n';

describe('i18n bundle', () => {
  it('serves bundled pt-BR and en resources at runtime', async () => {
    await i18n.changeLanguage('pt-BR');

    expect(i18n.t('home.title')).toBe('Início');
    expect(i18n.t('createList.title')).toBe('Criar lista');
    expect(i18n.t('preferences.currencyUsd')).toBe('dólar americano');
    expect(i18n.t('createList.currencyLockedHint')).toBe('A moeda fica travada depois que existe o primeiro item.');
    expect(i18n.t('home.activeSummaryBody')).toBe('Listas abertas seguem em movimento até serem finalizadas.');
    expect(i18n.t('home.emptyTitle')).toBe('Nada para revisar ainda');
    expect(i18n.t('createList.nameHint')).toBe('Dê um nome claro para a lista.');
    expect(i18n.t('units.piece')).toBe('peça');
    expect(i18n.t('plannedItem.title')).toBe('Item planejado');
    expect(i18n.t('app.loading')).toBe('Carregando a base do app…');
    expect(i18n.t('feedback.undo')).toBe('Desfazer');

    await i18n.changeLanguage('en');

    expect(i18n.t('home.title')).toBe('Home');
    expect(i18n.t('createList.title')).toBe('Create list');
    expect(i18n.t('preferences.currencyUsd')).toBe('US dollar');
    expect(i18n.t('createList.currencyLockedHint')).toBe('Currency is locked after the first item exists.');
    expect(i18n.t('home.finalizedSummaryBody')).toBe('Finished lists stay readable and can be reopened later.');
    expect(i18n.t('home.emptyTitle')).toBe('Nothing to review yet');
    expect(i18n.t('createList.nameHint')).toBe('Give the list a clear name.');
    expect(i18n.t('units.piece')).toBe('piece');
    expect(i18n.t('plannedItem.title')).toBe('Planned item');
    expect(i18n.t('app.error')).toBe('Unable to start the app shell.');
    expect(i18n.t('feedback.undo')).toBe('Undo');
  });
});
