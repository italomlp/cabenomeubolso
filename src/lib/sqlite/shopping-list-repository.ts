import {
  calculateShoppingListTotals,
  isSupportedShoppingListUnitCode,
  normalizeShoppingListName,
  validateShoppingList,
  validateShoppingListForSave,
  validateShoppingListItem,
  type ShoppingList,
  type ShoppingListItem,
  type ShoppingListStatus,
} from '@/domain/shopping-list';
import type { ShoppingListQuery, ShoppingListRepository } from '@/domain/shopping-list-repository';
import type { SupportedCurrency } from '@/domain/currency';

export type SQLiteShoppingListRepositoryDatabase = {
  execAsync: (sql: string) => Promise<void>;
  getAllAsync: <T>(sql: string, ...params: readonly unknown[]) => Promise<readonly T[]>;
  // expo-sqlite returns null when a SELECT ... LIMIT 1 query has no row.
  getFirstAsync: <T>(sql: string, ...params: readonly unknown[]) => Promise<T | null | undefined>;
  runAsync: (sql: string, ...params: readonly unknown[]) => Promise<unknown>;
  withExclusiveTransactionAsync?: (
    task: (database: SQLiteShoppingListRepositoryDatabase) => Promise<void>
  ) => Promise<void>;
  withTransactionAsync: (
    task: (database: SQLiteShoppingListRepositoryDatabase) => Promise<void>
  ) => Promise<void>;
};

export type SQLiteShoppingListRepository = ShoppingListRepository & {
  resetForDevelopment: () => Promise<void>;
};

type ShoppingListRow = {
  budget_minor: number;
  created_at: string;
  currency_code: string;
  deleted_at?: string | null;
  finalized_at?: string | null;
  id: string;
  name: string;
  status?: string | null;
  updated_at: string;
};

type ShoppingListItemRow = {
  actual_unit_minor: number | null;
  created_at: string;
  deleted_at?: string | null;
  id: string;
  list_id: string;
  name: string;
  planned_unit_minor: number;
  purchased_at: string | null;
  quantity_milli: number;
  sort_order: number;
  unit_code: string;
  updated_at: string;
};

type TransactionTask = (database: SQLiteShoppingListRepositoryDatabase) => Promise<void>;

type TransactionalDatabase = SQLiteShoppingListRepositoryDatabase & {
  withExclusiveTransactionAsync?: (task: TransactionTask) => Promise<void>;
};

const SHOPPING_LIST_TABLE = 'shopping_lists';
const SHOPPING_LIST_ITEM_TABLE = 'shopping_list_items';

function formatValidationErrors(prefix: string, errors: readonly { field: string; message: string }[]): string {
  return `${prefix}: ${errors.map((issue) => `${issue.field}: ${issue.message}`).join('; ')}`;
}

function validateRowOrThrow<T extends { id: string }>(
  rowLabel: string,
  validation:
    | { success: true; value: T }
    | { errors: readonly { field: string; message: string }[]; success: false }
): T {
  if (validation.success) {
    return validation.value;
  }

  throw new Error(formatValidationErrors(`${rowLabel} row`, validation.errors));
}

function createStatusFilter(query?: ShoppingListQuery): { clause: string; values: readonly unknown[] } {
  const statuses = query?.status;

  if (statuses === undefined || statuses.length === 0) {
    return { clause: '', values: [] };
  }

  const placeholders = statuses.map(() => '?').join(', ');
  return {
    clause: ` AND status IN (${placeholders})`,
    values: statuses,
  };
}

function buildDeletedFilter(includeDeleted: boolean | undefined): string {
  return includeDeleted ? '' : ' AND deleted_at IS NULL';
}

function hasLockedPersistedCurrencyState(list: ShoppingList): boolean {
  const hasNonDeletedItems = list.items.some((item) => item.deletedAt === null);
  const hasActualSpending = list.items.some(
    (item) => item.purchasedAt !== null && item.actualUnitMinor !== null && item.actualUnitMinor > 0
  );

  if (hasNonDeletedItems || hasActualSpending) {
    return true;
  }

  return calculateShoppingListTotals(list).actualMinor > 0;
}

function mapShoppingListRow(row: ShoppingListRow): ShoppingList {
  const shoppingList = {
    budgetMinor: row.budget_minor,
    createdAt: row.created_at,
    currencyCode: row.currency_code as SupportedCurrency,
    deletedAt: row.deleted_at ?? null,
    finalizedAt: row.finalized_at ?? null,
    id: row.id,
    items: [],
    name: normalizeShoppingListName(row.name),
    status: (row.status ?? 'draft') as ShoppingListStatus,
    updatedAt: row.updated_at,
  };

  return validateRowOrThrow('Shopping list', validateShoppingList(shoppingList));
}

function mapShoppingListItemRow(row: ShoppingListItemRow): ShoppingListItem {
  if (!isSupportedShoppingListUnitCode(row.unit_code)) {
    throw new Error(`Unsupported unit code: ${row.unit_code}`);
  }

  const shoppingListItem = {
    actualUnitMinor: row.actual_unit_minor,
    createdAt: row.created_at,
    deletedAt: row.deleted_at ?? null,
    id: row.id,
    listId: row.list_id,
    name: normalizeShoppingListName(row.name),
    plannedUnitMinor: row.planned_unit_minor,
    purchasedAt: row.purchased_at,
    quantityMilli: row.quantity_milli,
    sortOrder: row.sort_order,
    unitCode: row.unit_code,
    updatedAt: row.updated_at,
  };

  return validateRowOrThrow('Shopping list item', validateShoppingListItem(shoppingListItem));
}

function groupItemsByListId(items: readonly ShoppingListItem[]): ReadonlyMap<string, readonly ShoppingListItem[]> {
  const grouped = new Map<string, ShoppingListItem[]>();

  for (const item of items) {
    const existing = grouped.get(item.listId) ?? [];
    grouped.set(item.listId, [...existing, item]);
  }

  return grouped;
}

async function runInTransaction(
  database: TransactionalDatabase,
  task: TransactionTask
): Promise<void> {
  if (database.withExclusiveTransactionAsync !== undefined) {
    await database.withExclusiveTransactionAsync(task);
    return;
  }

  await database.withTransactionAsync(task);
}

async function loadShoppingLists(
  database: SQLiteShoppingListRepositoryDatabase,
  query?: ShoppingListQuery
): Promise<readonly ShoppingList[]> {
  const deletedFilter = buildDeletedFilter(query?.includeDeleted);
  const statusFilter = createStatusFilter(query);
  const rows = await database.getAllAsync<ShoppingListRow>(
    `SELECT id, name, currency_code, budget_minor, status, finalized_at, deleted_at, created_at, updated_at
     FROM ${SHOPPING_LIST_TABLE}
     WHERE 1 = 1${deletedFilter}${statusFilter.clause}
     ORDER BY updated_at DESC, created_at DESC, id DESC`,
    ...statusFilter.values
  );

  if (rows.length === 0) {
    return [];
  }

  const listIds = rows.map((row) => row.id);
  const itemDeletedFilter = buildDeletedFilter(query?.includeDeleted);
  const itemRows = await database.getAllAsync<ShoppingListItemRow>(
    `SELECT id, list_id, name, unit_code, quantity_milli, planned_unit_minor, actual_unit_minor,
            purchased_at, sort_order, deleted_at, created_at, updated_at
     FROM ${SHOPPING_LIST_ITEM_TABLE}
     WHERE list_id IN (${listIds.map(() => '?').join(', ')})${itemDeletedFilter}
     ORDER BY list_id, sort_order, created_at, id`,
    ...listIds
  );

  const items = itemRows.map(mapShoppingListItemRow);
  const itemsByListId = groupItemsByListId(items);

  return rows.map((row) => ({
    ...mapShoppingListRow(row),
    items: itemsByListId.get(row.id) ?? [],
  }));
}

async function loadShoppingListById(
  database: SQLiteShoppingListRepositoryDatabase,
  id: string,
  query?: ShoppingListQuery
): Promise<ShoppingList | null> {
  const deletedFilter = buildDeletedFilter(query?.includeDeleted);
  const listRow = await database.getFirstAsync<ShoppingListRow>(
    `SELECT id, name, currency_code, budget_minor, status, finalized_at, deleted_at, created_at, updated_at
     FROM ${SHOPPING_LIST_TABLE}
     WHERE id = ?${deletedFilter}`,
    id
  );

  if (listRow === undefined || listRow === null) {
    return null;
  }

  const itemDeletedFilter = buildDeletedFilter(query?.includeDeleted);
  const itemRows = await database.getAllAsync<ShoppingListItemRow>(
    `SELECT id, list_id, name, unit_code, quantity_milli, planned_unit_minor, actual_unit_minor,
            purchased_at, sort_order, deleted_at, created_at, updated_at
     FROM ${SHOPPING_LIST_ITEM_TABLE}
     WHERE list_id = ?${itemDeletedFilter}
     ORDER BY sort_order, created_at, id`,
    id
  );

  return {
    ...mapShoppingListRow(listRow),
    items: itemRows.map(mapShoppingListItemRow),
  };
}

async function loadTrashLists(database: SQLiteShoppingListRepositoryDatabase): Promise<readonly ShoppingList[]> {
  const rows = await database.getAllAsync<ShoppingListRow>(
    `SELECT id, name, currency_code, budget_minor, status, finalized_at, deleted_at, created_at, updated_at
     FROM ${SHOPPING_LIST_TABLE}
     WHERE deleted_at IS NOT NULL OR EXISTS (
       SELECT 1 FROM ${SHOPPING_LIST_ITEM_TABLE} item
       WHERE item.list_id = shopping_lists.id AND item.deleted_at IS NOT NULL
     )
     ORDER BY updated_at DESC, created_at DESC, id DESC`
  );

  const result: ShoppingList[] = [];
  for (const row of rows) {
    const itemRows = await database.getAllAsync<ShoppingListItemRow>(
      `SELECT id, list_id, name, unit_code, quantity_milli, planned_unit_minor, actual_unit_minor,
              purchased_at, sort_order, deleted_at, created_at, updated_at
       FROM ${SHOPPING_LIST_ITEM_TABLE}
       WHERE list_id = ? ORDER BY sort_order, created_at, id`,
      row.id
    );
    result.push({ ...mapShoppingListRow(row), items: itemRows.map(mapShoppingListItemRow) });
  }

  return result;
}

function buildListUpsertStatement(): string {
  return `
    INSERT INTO ${SHOPPING_LIST_TABLE} (
      id, name, currency_code, budget_minor, status, finalized_at, deleted_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      currency_code = excluded.currency_code,
      budget_minor = excluded.budget_minor,
      status = excluded.status,
      finalized_at = excluded.finalized_at,
      deleted_at = excluded.deleted_at,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at
  `;
}

function buildItemUpsertStatement(): string {
  return `
    INSERT INTO ${SHOPPING_LIST_ITEM_TABLE} (
      id, list_id, name, unit_code, quantity_milli, planned_unit_minor, actual_unit_minor,
      purchased_at, sort_order, deleted_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      list_id = excluded.list_id,
      name = excluded.name,
      unit_code = excluded.unit_code,
      quantity_milli = excluded.quantity_milli,
      planned_unit_minor = excluded.planned_unit_minor,
      actual_unit_minor = excluded.actual_unit_minor,
      purchased_at = excluded.purchased_at,
      sort_order = excluded.sort_order,
      deleted_at = excluded.deleted_at,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at
  `;
}

export function createSQLiteShoppingListRepository(
  database: TransactionalDatabase
): SQLiteShoppingListRepository {
  return {
    get: async (id, query) => loadShoppingListById(database, id, query),
    list: async (query) => loadShoppingLists(database, query),
    listTrash: async () => loadTrashLists(database),
    purgeExpired: async (now) => {
      if (Number.isNaN(Date.parse(now))) throw new Error('Trash cleanup timestamp is required.');
      const cutoff = new Date(Date.parse(now) - 7 * 24 * 60 * 60 * 1000).toISOString();
      await runInTransaction(database, async (transaction) => {
        // Child rows are purged first so parent deletion remains safe even on databases
        // where foreign-key cascades are not enabled by the caller.
        await transaction.runAsync(
          `DELETE FROM ${SHOPPING_LIST_ITEM_TABLE} WHERE deleted_at IS NOT NULL AND deleted_at <= ?`,
          cutoff
        );
        await transaction.runAsync(
          `DELETE FROM ${SHOPPING_LIST_ITEM_TABLE}
           WHERE list_id IN (SELECT id FROM ${SHOPPING_LIST_TABLE} WHERE deleted_at IS NOT NULL AND deleted_at <= ?)`,
          cutoff
        );
        await transaction.runAsync(
          `DELETE FROM ${SHOPPING_LIST_TABLE} WHERE deleted_at IS NOT NULL AND deleted_at <= ?`,
          cutoff
        );
      });
    },
    permanentlyDeleteItem: async (listId, itemId) => {
      await runInTransaction(database, async (transaction) => {
        await transaction.runAsync(
          `DELETE FROM ${SHOPPING_LIST_ITEM_TABLE} WHERE id = ? AND list_id = ?`,
          itemId,
          listId
        );
      });
    },
    permanentlyDeleteList: async (listId) => {
      await runInTransaction(database, async (transaction) => {
        await transaction.runAsync(`DELETE FROM ${SHOPPING_LIST_TABLE} WHERE id = ?`, listId);
      });
    },
    save: async (shoppingList) => {
      const normalizedShoppingList = {
        ...shoppingList,
        items: shoppingList.items.map((item) => ({
          ...item,
          name: normalizeShoppingListName(item.name),
        })),
        name: normalizeShoppingListName(shoppingList.name),
      };

      const validation = validateShoppingListForSave(normalizedShoppingList);

      if (!validation.success) {
        throw new Error(validation.errors.map((issue) => `${issue.field}: ${issue.message}`).join('; '));
      }

      await runInTransaction(database, async (transaction) => {
        const persistedShoppingList = await loadShoppingListById(transaction, normalizedShoppingList.id, {
          includeDeleted: true,
        });

        if (
          persistedShoppingList !== null &&
          persistedShoppingList.currencyCode !== normalizedShoppingList.currencyCode &&
          hasLockedPersistedCurrencyState(persistedShoppingList)
        ) {
          throw new Error('Cannot change the currency of a saved list with existing items or actual spending.');
        }

        await transaction.runAsync(
          buildListUpsertStatement(),
          normalizedShoppingList.id,
          normalizedShoppingList.name,
          normalizedShoppingList.currencyCode,
          normalizedShoppingList.budgetMinor,
          normalizedShoppingList.status,
          normalizedShoppingList.finalizedAt,
          normalizedShoppingList.deletedAt,
          normalizedShoppingList.createdAt,
          normalizedShoppingList.updatedAt
        );

        for (const item of normalizedShoppingList.items) {
          await transaction.runAsync(
            buildItemUpsertStatement(),
            item.id,
            item.listId,
            item.name,
            item.unitCode,
            item.quantityMilli,
            item.plannedUnitMinor,
            item.actualUnitMinor,
            item.purchasedAt,
            item.sortOrder,
            item.deletedAt,
            item.createdAt,
            item.updatedAt
          );
        }
      });
    },
    resetForDevelopment: async () => {
      await runInTransaction(database, async (transaction) => {
        await transaction.execAsync(
          `DELETE FROM template_items; DELETE FROM recurrence_templates; DELETE FROM ${SHOPPING_LIST_ITEM_TABLE}; DELETE FROM ${SHOPPING_LIST_TABLE};`
        );
      });
    },
  };
}

export { mapShoppingListItemRow, mapShoppingListRow };
export { calculateShoppingListTotals } from '@/domain/shopping-list';
