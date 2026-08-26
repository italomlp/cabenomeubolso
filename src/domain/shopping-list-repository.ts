import type { ShoppingList } from './shopping-list';

export type ShoppingListQuery = {
  includeDeleted?: boolean;
  status?: readonly ShoppingList['status'][];
};

export type ShoppingListTrashQuery = {
  now?: string;
};

export type ShoppingListLifecycleRepository = {
  listTrash?: (query?: ShoppingListTrashQuery) => Promise<readonly ShoppingList[]>;
  purgeExpired?: (now: string) => Promise<void>;
  permanentlyDeleteItem?: (listId: string, itemId: string) => Promise<void>;
  permanentlyDeleteList?: (listId: string) => Promise<void>;
};

export type ShoppingListRepository = ShoppingListLifecycleRepository & {
  get: (id: string, query?: ShoppingListQuery) => Promise<ShoppingList | null>;
  list: (query?: ShoppingListQuery) => Promise<readonly ShoppingList[]>;
  save: (shoppingList: ShoppingList) => Promise<void>;
};
