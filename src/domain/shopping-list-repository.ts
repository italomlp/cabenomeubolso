import type { ShoppingList } from './shopping-list';

export type ShoppingListQuery = {
  includeDeleted?: boolean;
  status?: readonly ShoppingList['status'][];
};

export type ShoppingListRepository = {
  get: (id: string, query?: ShoppingListQuery) => Promise<ShoppingList | null>;
  list: (query?: ShoppingListQuery) => Promise<readonly ShoppingList[]>;
  save: (shoppingList: ShoppingList) => Promise<void>;
};
