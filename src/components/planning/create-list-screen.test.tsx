import { describe, expect, it } from '@jest/globals';

import { i18n } from '@/lib/localization/i18n';

import { hasUnpurchasedPlannedItems } from './create-list-finalization';

describe('create-list finalization confirmation', () => {
  it('requests confirmation while visible planned items remain unpurchased', () => {
    expect(hasUnpurchasedPlannedItems([{ deletedAt: null, purchasedAt: null }])).toBe(true);
    expect(hasUnpurchasedPlannedItems([{ deletedAt: '2026-08-25T12:00:00.000Z', purchasedAt: null }])).toBe(false);
    expect(hasUnpurchasedPlannedItems([{ deletedAt: null, purchasedAt: '2026-08-25T12:00:00.000Z' }])).toBe(false);
  });

  it('provides localized confirmation copy and action-oriented shopping labels', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('createList.finalizeConfirmationTitle')).toBe('Unpurchased items remain');
    expect(i18n.t('createList.finalizeConfirm')).toBe('Finalize anyway');
    expect(i18n.t('shopping.buy')).toBe('Buy');

    await i18n.changeLanguage('pt-BR');
    expect(i18n.t('createList.finalizeConfirmationTitle')).toBe('Ainda há itens não comprados');
    expect(i18n.t('createList.finalizeConfirm')).toBe('Finalizar mesmo assim');
    expect(i18n.t('shopping.buy')).toBe('Comprar');
  });
});
