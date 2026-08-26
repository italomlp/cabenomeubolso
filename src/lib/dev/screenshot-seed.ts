import type { ShoppingList } from '@/domain/shopping-list';

/** Stable, local-only records used by the development screenshot flow. */
export const DEV_SCREENSHOT_SEED: readonly ShoppingList[] = [
  {
    budgetMinor: 4_000,
    createdAt: '2026-01-01T00:00:00.000Z',
    currencyCode: 'USD',
    deletedAt: null,
    finalizedAt: null,
    id: 'dev-screenshot-list',
    items: [
      {
        actualUnitMinor: null,
        createdAt: '2026-01-01T00:00:01.000Z',
        deletedAt: null,
        id: 'dev-screenshot-list-item-1',
        listId: 'dev-screenshot-list',
        name: 'Eggs',
        plannedUnitMinor: 350,
        purchasedAt: null,
        quantityMilli: 12_000,
        sortOrder: 1,
        unitCode: 'piece',
        updatedAt: '2026-01-01T00:00:01.000Z',
      },
      {
        actualUnitMinor: null,
        createdAt: '2026-01-01T00:00:02.000Z',
        deletedAt: null,
        id: 'dev-screenshot-list-item-2',
        listId: 'dev-screenshot-list',
        name: 'Rice',
        plannedUnitMinor: 600,
        purchasedAt: null,
        quantityMilli: 500_000,
        sortOrder: 2,
        unitCode: 'g',
        updatedAt: '2026-01-01T00:00:02.000Z',
      },
    ],
    name: 'Screenshot grocery list',
    status: 'active',
    updatedAt: '2026-01-01T00:00:02.000Z',
  },
];
