import type { SupportedCurrency } from './currency';

export type ShoppingListUnitCode = 'piece' | 'pack' | 'kg' | 'g' | 'l' | 'ml';

export type ShoppingListStatus = 'draft' | 'active' | 'finalized';

export type ShoppingListTotals = {
  actualMinor: number;
  plannedMinor: number;
  remainingMinor: number;
  varianceMinor: number;
};

export type ShoppingListItem = {
  actualUnitMinor: number | null;
  createdAt: string;
  deletedAt: string | null;
  id: string;
  listId: string;
  name: string;
  plannedUnitMinor: number;
  purchasedAt: string | null;
  quantityMilli: number;
  sortOrder: number;
  unitCode: ShoppingListUnitCode;
  updatedAt: string;
};

export type ShoppingList = {
  budgetMinor: number;
  createdAt: string;
  currencyCode: SupportedCurrency;
  deletedAt: string | null;
  finalizedAt: string | null;
  id: string;
  items: readonly ShoppingListItem[];
  name: string;
  status: ShoppingListStatus;
  updatedAt: string;
};

export type ShoppingListValidationIssue = {
  field: string;
  message: string;
};

export type ValidationResult<T> =
  | {
      success: true;
      value: T;
    }
  | {
      errors: readonly ShoppingListValidationIssue[];
      success: false;
    };

const SHARED_UNIT_CODES = new Set<ShoppingListUnitCode>(['piece', 'pack', 'kg', 'g', 'l', 'ml']);

const WHOLE_UNITS = new Set<ShoppingListUnitCode>(['piece', 'pack', 'g', 'ml']);

const SHARED_STATUSES = new Set<ShoppingListStatus>(['draft', 'active', 'finalized']);

const SHARED_CURRENCIES = new Set<SupportedCurrency>(['BRL', 'USD']);

function isSafeNonNegativeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function isSafePositiveInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

function isValidTimestamp(value: string): boolean {
  return value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

export function normalizeShoppingListName(name: string): string {
  return name.trim();
}

export function isSupportedShoppingListUnitCode(unitCode: string): unitCode is ShoppingListUnitCode {
  return SHARED_UNIT_CODES.has(unitCode as ShoppingListUnitCode);
}

export function isSupportedShoppingListStatus(status: string): status is ShoppingListStatus {
  return SHARED_STATUSES.has(status as ShoppingListStatus);
}

export function isSupportedShoppingListCurrency(currencyCode: string): currencyCode is SupportedCurrency {
  return SHARED_CURRENCIES.has(currencyCode as SupportedCurrency);
}

export function validateShoppingListQuantity(
  unitCode: ShoppingListUnitCode,
  quantityMilli: number
): ValidationResult<number> {
  const issues: ShoppingListValidationIssue[] = [];

  if (!Number.isSafeInteger(quantityMilli)) {
    issues.push({ field: 'quantityMilli', message: 'Quantity must be an integer.' });
  } else if (quantityMilli <= 0) {
    issues.push({ field: 'quantityMilli', message: 'Quantity must be greater than zero.' });
  }

  if (Number.isSafeInteger(quantityMilli) && quantityMilli > 0 && WHOLE_UNITS.has(unitCode)) {
    if (quantityMilli % 1000 !== 0) {
      issues.push({
        field: 'quantityMilli',
        message: 'Whole-unit quantities must be divisible by 1000.',
      });
    }
  }

  return issues.length > 0 ? { success: false, errors: issues } : { success: true, value: quantityMilli };
}

export function validateShoppingListItem(item: ShoppingListItem): ValidationResult<ShoppingListItem> {
  const issues: ShoppingListValidationIssue[] = [];

  if (normalizeShoppingListName(item.name).length === 0) {
    issues.push({ field: 'name', message: 'Item name is required.' });
  }

  if (!isSupportedShoppingListUnitCode(item.unitCode)) {
    issues.push({ field: 'unitCode', message: 'Unit code is invalid.' });
  }

  if (!isSafePositiveInteger(item.sortOrder)) {
    issues.push({ field: 'sortOrder', message: 'Sort order must be a positive integer.' });
  }

  if (!isSafeNonNegativeInteger(item.plannedUnitMinor)) {
    issues.push({ field: 'plannedUnitMinor', message: 'Planned unit price must be a non-negative integer.' });
  }

  if (item.actualUnitMinor !== null && !isSafeNonNegativeInteger(item.actualUnitMinor)) {
    issues.push({ field: 'actualUnitMinor', message: 'Actual unit price must be a non-negative integer or null.' });
  }

  if (!isValidTimestamp(item.createdAt)) {
    issues.push({ field: 'createdAt', message: 'Created timestamp is required.' });
  }

  if (!isValidTimestamp(item.updatedAt)) {
    issues.push({ field: 'updatedAt', message: 'Updated timestamp is required.' });
  }

  if (item.deletedAt !== null && !isValidTimestamp(item.deletedAt)) {
    issues.push({ field: 'deletedAt', message: 'Deleted timestamp must be a valid timestamp or null.' });
  }

  if (item.purchasedAt !== null && !isValidTimestamp(item.purchasedAt)) {
    issues.push({ field: 'purchasedAt', message: 'Purchased timestamp must be a valid timestamp or null.' });
  }

  if (isSupportedShoppingListUnitCode(item.unitCode)) {
    const quantityValidation = validateShoppingListQuantity(item.unitCode, item.quantityMilli);

    if (!quantityValidation.success) {
      issues.push(...quantityValidation.errors);
    }
  }

  if (item.purchasedAt !== null && item.actualUnitMinor === null) {
    issues.push({
      field: 'actualUnitMinor',
      message: 'Purchased items require an explicit actual unit price.',
    });
  }

  return issues.length > 0 ? { success: false, errors: issues } : { success: true, value: item };
}

export function validateShoppingList(list: ShoppingList): ValidationResult<ShoppingList> {
  const issues: ShoppingListValidationIssue[] = [];

  if (normalizeShoppingListName(list.name).length === 0) {
    issues.push({ field: 'name', message: 'List name is required.' });
  }

  if (!isSafeNonNegativeInteger(list.budgetMinor)) {
    issues.push({ field: 'budgetMinor', message: 'Budget must be a non-negative integer.' });
  }

  if (!isSupportedShoppingListCurrency(list.currencyCode)) {
    issues.push({ field: 'currencyCode', message: 'Currency code is invalid.' });
  }

  if (!isSupportedShoppingListStatus(list.status)) {
    issues.push({ field: 'status', message: 'Status is invalid.' });
  }

  if (!isValidTimestamp(list.createdAt)) {
    issues.push({ field: 'createdAt', message: 'Created timestamp is required.' });
  }

  if (!isValidTimestamp(list.updatedAt)) {
    issues.push({ field: 'updatedAt', message: 'Updated timestamp is required.' });
  }

  if (list.deletedAt !== null && !isValidTimestamp(list.deletedAt)) {
    issues.push({ field: 'deletedAt', message: 'Deleted timestamp must be a valid timestamp or null.' });
  }

  if (list.finalizedAt !== null && !isValidTimestamp(list.finalizedAt)) {
    issues.push({ field: 'finalizedAt', message: 'Finalized timestamp must be a valid timestamp or null.' });
  }

  for (const item of list.items) {
    const validation = validateShoppingListItem(item);

    if (!validation.success) {
      issues.push(...validation.errors.map((issue) => ({ field: `items.${item.id}.${issue.field}`, message: issue.message })));
    }

    if (item.listId !== list.id) {
      issues.push({ field: `items.${item.id}.listId`, message: 'Item list id must match the parent list.' });
    }
  }

  return issues.length > 0 ? { success: false, errors: issues } : { success: true, value: list };
}

export function roundMinorUnits(quantityMilli: number, unitMinor: number): number {
  if (!Number.isSafeInteger(quantityMilli) || !Number.isSafeInteger(unitMinor)) {
    throw new Error('Quantity and unit price must be safe integers.');
  }

  if (quantityMilli < 0 || unitMinor < 0) {
    throw new Error('Quantity and unit price must be non-negative.');
  }

  const scaled = BigInt(quantityMilli) * BigInt(unitMinor);
  const rounded = (scaled + 500n) / 1000n;

  if (rounded > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error('Calculated money exceeds the safe integer range.');
  }

  return Number(rounded);
}

export function calculateShoppingListItemPlannedMinor(item: ShoppingListItem): number {
  return roundMinorUnits(item.quantityMilli, item.plannedUnitMinor);
}

export function calculateShoppingListItemActualMinor(item: ShoppingListItem): number {
  if (item.purchasedAt === null || item.actualUnitMinor === null) {
    return 0;
  }

  return roundMinorUnits(item.quantityMilli, item.actualUnitMinor);
}

export function calculateShoppingListTotals(list: ShoppingList): ShoppingListTotals {
  const visibleItems = list.items.filter((item) => item.deletedAt === null);

  const plannedMinor = visibleItems.reduce((total, item) => {
    const nextTotal = total + calculateShoppingListItemPlannedMinor(item);

    if (!Number.isSafeInteger(nextTotal)) {
      throw new Error('Calculated money exceeds the safe integer range.');
    }

    return nextTotal;
  }, 0);
  const actualMinor = visibleItems.reduce((total, item) => {
    const nextTotal = total + calculateShoppingListItemActualMinor(item);

    if (!Number.isSafeInteger(nextTotal)) {
      throw new Error('Calculated money exceeds the safe integer range.');
    }

    return nextTotal;
  }, 0);

  if (!Number.isSafeInteger(list.budgetMinor)) {
    throw new Error('Budget must be a safe integer.');
  }

  const remainingMinor = list.budgetMinor - actualMinor;
  const varianceMinor = actualMinor - plannedMinor;

  if (!Number.isSafeInteger(remainingMinor) || !Number.isSafeInteger(varianceMinor)) {
    throw new Error('Calculated money exceeds the safe integer range.');
  }

  return {
    actualMinor,
    plannedMinor,
    remainingMinor,
    varianceMinor,
  };
}

function assertShoppingListIsMutable(list: ShoppingList): void {
  if (list.deletedAt !== null) {
    throw new Error('Cannot mutate a deleted shopping list.');
  }
}

function assertShoppingListItemIsMutable(list: ShoppingList, item: ShoppingListItem): void {
  assertShoppingListIsMutable(list);

  if (item.deletedAt !== null) {
    throw new Error('Cannot mutate a deleted shopping list item.');
  }
}

export function markShoppingListItemPurchased(
  list: ShoppingList,
  itemId: string,
  actualUnitMinor: number,
  purchasedAt: string
): ShoppingList {
  assertShoppingListIsMutable(list);

  if (!isSafeNonNegativeInteger(actualUnitMinor)) {
    throw new Error('Actual unit price must be a non-negative integer.');
  }

  if (!isValidTimestamp(purchasedAt)) {
    throw new Error('Purchased timestamp is required.');
  }

  let itemFound = false;
  const items = list.items.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    assertShoppingListItemIsMutable(list, item);
    itemFound = true;

    return {
      ...item,
      actualUnitMinor,
      purchasedAt,
      updatedAt: purchasedAt,
    };
  });

  if (!itemFound) {
    throw new Error(`Shopping list item not found: ${itemId}`);
  }

  return {
    ...list,
    items,
    updatedAt: purchasedAt,
  };
}

export function markShoppingListItemUnpurchased(list: ShoppingList, itemId: string, updatedAt: string): ShoppingList {
  assertShoppingListIsMutable(list);

  if (!isValidTimestamp(updatedAt)) {
    throw new Error('Updated timestamp is required.');
  }

  let itemFound = false;
  const items = list.items.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    assertShoppingListItemIsMutable(list, item);
    itemFound = true;

    return {
      ...item,
      purchasedAt: null,
      updatedAt,
    };
  });

  if (!itemFound) {
    throw new Error(`Shopping list item not found: ${itemId}`);
  }

  return {
    ...list,
    items,
    updatedAt,
  };
}
