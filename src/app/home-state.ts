import { formatCurrencyMinor, parseCurrencyMinor } from '@/lib/locale-input';
import { resolveLocalizationPreferences, type LocaleLike, type LocalizationPreferences } from '@/lib/localization/resolution';

import type { SupportedCurrency } from '@/domain/currency';
import {
  normalizeShoppingListName,
  validateShoppingListForSave,
  type ShoppingList,
  type ShoppingListItem,
} from '@/domain/shopping-list';

const DEFAULT_DRAFT_LIST_ID = 'home-create-list-draft';

export type CreateListDraftState = {
  budgetText: string;
  currencyCode: SupportedCurrency;
  itemCount: number;
  items: readonly ShoppingListItem[];
  listId: string;
  name: string;
  status?: ShoppingList['status'];
};

function createDraftPlaceholderItem(index: number, listId: string, timestamp: string): ShoppingListItem {
  return {
    actualUnitMinor: null,
    createdAt: timestamp,
    deletedAt: null,
    id: `${listId}-item-${index + 1}`,
    listId,
    name: `placeholder-${index + 1}`,
    plannedUnitMinor: 0,
    purchasedAt: null,
    quantityMilli: 1000,
    sortOrder: index + 1,
    unitCode: 'piece',
    updatedAt: timestamp,
  };
}

function normalizeDraftItems(items: readonly ShoppingListItem[], listId: string, timestamp: string): ShoppingListItem[] {
  if (items.length === 0) {
    return [];
  }

  return items.map((item, index) => ({
    ...item,
    createdAt: item.createdAt,
    deletedAt: item.deletedAt,
    id: item.id ?? `${listId}-item-${index + 1}`,
    listId,
    name: normalizeShoppingListName(item.name),
    sortOrder: index + 1,
    updatedAt: item.updatedAt ?? timestamp,
  }));
}

export function createEmptyCreateListDraftState(
  currencyCode: SupportedCurrency,
  listId = DEFAULT_DRAFT_LIST_ID
): CreateListDraftState {
  return {
    budgetText: '',
    currencyCode,
    itemCount: 0,
    items: [],
    listId,
    name: '',
    status: 'draft',
  };
}

export function createCreateListDraftStateFromList(
  list: ShoppingList,
  locale: string,
  listId = list.id
): CreateListDraftState {
  return {
    budgetText: formatCurrencyMinor(locale, list.budgetMinor, list.currencyCode),
    currencyCode: list.currencyCode,
    itemCount: list.items.filter((item) => item.deletedAt === null).length,
    items: normalizeDraftItems(list.items, listId, list.updatedAt),
    listId,
    name: list.name,
    status: list.status,
  };
}

export function buildCreateListDraft(
  state: CreateListDraftState,
  timestamp = new Date().toISOString(),
  locale = 'en'
): ShoppingList {
  const items = state.items.length > 0 ? state.items : Array.from({ length: state.itemCount }, (_, index) => createDraftPlaceholderItem(index, state.listId, timestamp));

  return {
    budgetMinor: parseCurrencyMinor(locale, state.budgetText, state.currencyCode),
    createdAt: timestamp,
    currencyCode: state.currencyCode,
    deletedAt: null,
    finalizedAt: null,
    id: state.listId,
    items: items.map((item, index) => ({
      ...item,
      id: item.id ?? `${state.listId}-item-${index + 1}`,
      listId: state.listId,
      name: normalizeShoppingListName(item.name),
      sortOrder: index + 1,
      updatedAt: item.updatedAt ?? timestamp,
    })),
    name: normalizeShoppingListName(state.name),
    status: 'draft',
    updatedAt: timestamp,
  };
}

export function canPersistCreateListDraft(state: CreateListDraftState, locale = 'en'): boolean {
  if (state.status === 'finalized') {
    return false;
  }

  try {
    return validateShoppingListForSave(buildCreateListDraft(state, new Date().toISOString(), locale)).success;
  } catch {
    return false;
  }
}

export function resolveCreateListCurrency(
  preferences: LocalizationPreferences,
  locales: readonly LocaleLike[]
): SupportedCurrency {
  return resolveLocalizationPreferences(preferences, locales).currency;
}

export { DEFAULT_DRAFT_LIST_ID };
