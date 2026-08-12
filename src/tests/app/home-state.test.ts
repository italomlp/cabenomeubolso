import { describe, expect, it } from '@jest/globals';

import {
  buildCreateListDraft,
  createCreateListDraftStateFromList,
  createEmptyCreateListDraftState,
} from '../../app/home-state';

describe('create-list draft state', () => {
  it('generates a distinct list and item identity for each new draft', () => {
    const first = createEmptyCreateListDraftState('BRL');
    const second = createEmptyCreateListDraftState('BRL');
    const firstList = buildCreateListDraft({ ...first, budgetText: '10', itemCount: 1, name: 'First list' }, '2026-08-12T00:00:00.000Z');
    const secondList = buildCreateListDraft({ ...second, budgetText: '10', itemCount: 1, name: 'Second list' }, '2026-08-12T00:00:00.000Z');

    expect(firstList.id).not.toBe(secondList.id);
    expect(firstList.items[0]?.id).toBeTruthy();
    expect(secondList.items[0]?.id).toBeTruthy();
    expect(firstList.items[0]?.id).not.toBe(secondList.items[0]?.id);
    expect(firstList.items[0]?.listId).toBe(firstList.id);
    expect(secondList.items[0]?.listId).toBe(secondList.id);
  });

  it('preserves list metadata when an existing list is edited and saved', () => {
    const original = {
      budgetMinor: 1000,
      createdAt: '2026-08-01T00:00:00.000Z',
      currencyCode: 'BRL' as const,
      deletedAt: '2026-08-10T00:00:00.000Z',
      finalizedAt: '2026-08-09T00:00:00.000Z',
      id: 'list-existing',
      items: [
        {
          actualUnitMinor: null,
          createdAt: '2026-08-01T00:00:00.000Z',
          deletedAt: null,
          id: 'item-existing',
          listId: 'list-existing',
          name: 'Milk',
          plannedUnitMinor: 500,
          purchasedAt: null,
          quantityMilli: 1000,
          sortOrder: 1,
          unitCode: 'piece' as const,
          updatedAt: '2026-08-01T00:00:00.000Z',
        },
      ],
      name: 'Original name',
      status: 'draft' as const,
      updatedAt: '2026-08-08T00:00:00.000Z',
    };
    const state = createCreateListDraftStateFromList(original, 'en');
    const saved = buildCreateListDraft({ ...state, name: 'Edited name' }, '2026-08-12T00:00:00.000Z');

    expect(saved).toMatchObject({
      createdAt: original.createdAt,
      deletedAt: original.deletedAt,
      finalizedAt: original.finalizedAt,
      id: original.id,
      name: 'Edited name',
      status: original.status,
    });
  });
});
