import type { ShoppingList } from './shopping-list';
import {
  markShoppingListItemPurchased,
  markShoppingListItemUnpurchased,
  validateShoppingListForSave,
} from './shopping-list';
import type { ShoppingListRepository } from './shopping-list-repository';

export type ShoppingListUseCaseDependencies = {
  now?: () => string;
  repository: ShoppingListRepository;
};

export type ShoppingListUseCases = {
  loadList: (id: string, includeDeleted?: boolean) => Promise<ShoppingList | null>;
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
  return {
    loadList: async (id, includeDeleted = false) => repository.get(id, { includeDeleted }),
    saveList: async (list) => {
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
