import type { ShoppingList } from './shopping-list';
import {
  finalizeShoppingList,
  markShoppingListItemPurchased,
  markShoppingListItemDeleted,
  markShoppingListItemUnpurchased,
  markShoppingListItemRestored,
  reopenShoppingList,
  validateShoppingListForSave,
} from './shopping-list';
import type { ShoppingListRepository } from './shopping-list-repository';

export type ShoppingListUseCaseDependencies = {
  now?: () => string;
  repository: ShoppingListRepository;
};

export type ShoppingListUseCases = {
  loadList: (id: string, includeDeleted?: boolean) => Promise<ShoppingList | null>;
  finalizeList: (listId: string) => Promise<ShoppingList>;
  reopenList: (listId: string) => Promise<ShoppingList>;
  removeItem: (listId: string, itemId: string) => Promise<ShoppingList>;
  restoreItem: (listId: string, itemId: string) => Promise<ShoppingList>;
  saveList: (list: ShoppingList) => Promise<void>;
  setItemPurchased: (listId: string, itemId: string, actualUnitMinor: number) => Promise<ShoppingList>;
  setItemUnpurchased: (listId: string, itemId: string) => Promise<ShoppingList>;
};

function requireLoadedList(list: ShoppingList | null, listId: string): ShoppingList {
  if (list === null) {
    throw new Error(`Shopping list not found: ${listId}`);
  }

  return list;
}

export function createShoppingListUseCases({ now = () => new Date().toISOString(), repository }: ShoppingListUseCaseDependencies): ShoppingListUseCases {
  function assertListCanBeEdited(list: ShoppingList): void {
    if (list.status === 'finalized') {
      throw new Error('Finalized shopping lists must be reopened before editing.');
    }
  }

  return {
    loadList: async (id, includeDeleted = false) => repository.get(id, { includeDeleted }),
    finalizeList: async (listId) => {
      const list = requireLoadedList(await repository.get(listId), listId);
      const updated = finalizeShoppingList(list, now());

      await repository.save(updated);
      return updated;
    },
    reopenList: async (listId) => {
      const list = requireLoadedList(await repository.get(listId), listId);
      const updated = reopenShoppingList(list, now());

      await repository.save(updated);
      return updated;
    },
    removeItem: async (listId, itemId) => {
      const list = requireLoadedList(await repository.get(listId), listId);
      assertListCanBeEdited(list);

      const visibleItemCount = list.items.filter((item) => item.deletedAt === null).length;

      if (visibleItemCount <= 1) {
        throw new Error('At least one non-deleted item is required.');
      }

      const updated = markShoppingListItemDeleted(list, itemId, now());
      const validation = validateShoppingListForSave(updated);

      if (!validation.success) {
        throw new Error(validation.errors.map((issue) => `${issue.field}: ${issue.message}`).join('; '));
      }

      await repository.save(updated);
      return updated;
    },
    restoreItem: async (listId, itemId) => {
      const list = requireLoadedList(await repository.get(listId), listId);
      assertListCanBeEdited(list);

      const updated = markShoppingListItemRestored(list, itemId, now());

      await repository.save(updated);
      return updated;
    },
    saveList: async (list) => {
      assertListCanBeEdited(list);

      const validation = validateShoppingListForSave(list);

      if (!validation.success) {
        throw new Error(validation.errors.map((issue) => `${issue.field}: ${issue.message}`).join('; '));
      }

      await repository.save(list);
    },
    setItemPurchased: async (listId, itemId, actualUnitMinor) => {
      const list = requireLoadedList(await repository.get(listId), listId);
      const purchasedAt = now();
      const updated = markShoppingListItemPurchased(list, itemId, actualUnitMinor, purchasedAt);

      await repository.save(updated);
      return updated;
    },
    setItemUnpurchased: async (listId, itemId) => {
      const list = requireLoadedList(await repository.get(listId), listId);
      const updated = markShoppingListItemUnpurchased(list, itemId, now());

      await repository.save(updated);
      return updated;
    },
  };
}
