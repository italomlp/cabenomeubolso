import type { ShoppingList } from './shopping-list';
import {
  cloneShoppingList,
  finalizeShoppingList,
  markShoppingListItemPurchased,
  markShoppingListItemDeleted,
  markShoppingListItemUnpurchased,
  markShoppingListItemRestored,
  markShoppingListDeleted,
  markShoppingListRestored,
  isShoppingListTrashExpired,
  reopenShoppingList,
  validateShoppingListForSave,
} from './shopping-list';
import type { ShoppingListRepository } from './shopping-list-repository';

export class ShoppingListFinalizeConfirmationRequiredError extends Error {
  constructor() {
    super('Confirmation is required to finalize with unpurchased items.');
    this.name = 'ShoppingListFinalizeConfirmationRequiredError';
  }
}

export type ShoppingListUseCaseDependencies = {
  createId?: (prefix: string) => string;
  now?: () => string;
  repository: ShoppingListRepository;
};

export type ShoppingListUseCases = {
  cleanupExpiredTrash: () => Promise<void>;
  deleteList: (listId: string) => Promise<ShoppingList>;
  loadList: (id: string, includeDeleted?: boolean) => Promise<ShoppingList | null>;
  listTrash: () => Promise<readonly ShoppingList[]>;
  permanentlyDeleteItem: (listId: string, itemId: string, confirmed: boolean) => Promise<void>;
  permanentlyDeleteList: (listId: string, confirmed: boolean) => Promise<void>;
  restoreList: (listId: string) => Promise<ShoppingList>;
  finalizeList: (listId: string, options?: { confirmUnpurchased?: boolean } | boolean) => Promise<ShoppingList>;
  cloneList: (listId: string, name?: string) => Promise<ShoppingList>;
  reopenList: (listId: string) => Promise<ShoppingList>;
  removeItem: (listId: string, itemId: string) => Promise<ShoppingList>;
  restoreItem: (listId: string, itemId: string) => Promise<ShoppingList>;
  saveList: (list: ShoppingList) => Promise<void>;
  setItemPurchased: (listId: string, itemId: string, actualUnitMinor?: number) => Promise<ShoppingList>;
  setItemUnpurchased: (listId: string, itemId: string) => Promise<ShoppingList>;
};

function requireLoadedList(list: ShoppingList | null, listId: string): ShoppingList {
  if (list === null) {
    throw new Error(`Shopping list not found: ${listId}`);
  }

  return list;
}

let generatedIdSequence = 0;

function defaultCreateId(prefix: string): string {
  generatedIdSequence += 1;
  const randomPart = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now().toString(36)}-${generatedIdSequence}-${randomPart}`;
}

export function createShoppingListUseCases({
  createId = defaultCreateId,
  now = () => new Date().toISOString(),
  repository,
}: ShoppingListUseCaseDependencies): ShoppingListUseCases {
  function assertListCanBeEdited(list: ShoppingList): void {
    if (list.status === 'finalized') {
      throw new Error('Finalized shopping lists must be reopened before editing.');
    }
  }

  return {
    cleanupExpiredTrash: async () => {
      if (repository.purgeExpired === undefined) {
        return;
      }

      await repository.purgeExpired(now());
    },
    deleteList: async (listId) => {
      const list = requireLoadedList(await repository.get(listId), listId);
      const updated = markShoppingListDeleted(list, now());
      await repository.save(updated);
      return updated;
    },
    loadList: async (id, includeDeleted = false) => repository.get(id, { includeDeleted }),
    listTrash: async () => {
      await (repository.purgeExpired?.(now()) ?? Promise.resolve());
      if (repository.listTrash === undefined) {
        return repository.list({ includeDeleted: true });
      }

      return repository.listTrash({ now: now() });
    },
    finalizeList: async (listId, options = false) => {
      const list = requireLoadedList(await repository.get(listId), listId);
      const confirmUnpurchased = typeof options === 'boolean' ? options : options.confirmUnpurchased === true;
      const hasUnpurchasedItems = list.items.some((item) => item.deletedAt === null && item.purchasedAt === null);

      if (hasUnpurchasedItems && !confirmUnpurchased) {
        throw new ShoppingListFinalizeConfirmationRequiredError();
      }

      const updated = finalizeShoppingList(list, now());

      await repository.save(updated);
      return updated;
    },
    cloneList: async (listId, name) => {
      const list = requireLoadedList(await repository.get(listId, { includeDeleted: true }), listId);
      const cloned = cloneShoppingList(list, now(), createId, { name });

      await repository.save(cloned);
      return cloned;
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
    permanentlyDeleteItem: async (listId, itemId, confirmed) => {
      if (!confirmed) throw new Error('Confirmation is required to permanently delete an item.');
      if (repository.permanentlyDeleteItem === undefined) throw new Error('Permanent item deletion is unavailable.');
      await repository.permanentlyDeleteItem(listId, itemId);
    },
    permanentlyDeleteList: async (listId, confirmed) => {
      if (!confirmed) throw new Error('Confirmation is required to permanently delete a list.');
      if (repository.permanentlyDeleteList === undefined) throw new Error('Permanent list deletion is unavailable.');
      await repository.permanentlyDeleteList(listId);
    },
    restoreItem: async (listId, itemId) => {
      const list = requireLoadedList(await repository.get(listId, { includeDeleted: true }), listId);
      assertListCanBeEdited(list);
      const item = list.items.find((candidate) => candidate.id === itemId);
      if (item?.deletedAt !== null && item !== undefined && isShoppingListTrashExpired(item.deletedAt, now())) {
        throw new Error('Cannot restore an expired shopping list item.');
      }

      const updated = markShoppingListItemRestored(list, itemId, now());

      await repository.save(updated);
      return updated;
    },
    restoreList: async (listId) => {
      const list = requireLoadedList(await repository.get(listId, { includeDeleted: true }), listId);
      if (list.deletedAt !== null && isShoppingListTrashExpired(list.deletedAt, now())) {
        throw new Error('Cannot restore an expired shopping list.');
      }
      const updated = markShoppingListRestored(list, now());
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
