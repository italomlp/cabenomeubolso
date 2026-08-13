import {
  isSupportedShoppingListCurrency,
  isSupportedShoppingListUnitCode,
  normalizeShoppingListName,
  type ShoppingList,
  type ShoppingListIdFactory,
  type ShoppingListItem,
  type ShoppingListValidationIssue,
  type ValidationResult,
} from './shopping-list';
import { validateShoppingListQuantity } from './shopping-list';
import type { SupportedCurrency } from './currency';

export type RecurrenceTemplateItem = {
  id: string;
  name: string;
  plannedUnitMinor: number;
  quantityMilli: number;
  sortOrder: number;
  templateId: string;
  unitCode: ShoppingListItem['unitCode'];
};

export type RecurrenceTemplate = {
  active: boolean;
  budgetMinor: number;
  cadence: string;
  createdAt: string;
  currencyCode: SupportedCurrency;
  id: string;
  items: readonly RecurrenceTemplateItem[];
  name: string;
  nextOccurrenceOn: string | null;
  sourceListId: string | null;
  updatedAt: string;
};

function validTimestamp(value: string): boolean {
  return value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

function safeNonNegative(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function safePositive(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

export function validateRecurrenceTemplate(template: RecurrenceTemplate): ValidationResult<RecurrenceTemplate> {
  const errors: ShoppingListValidationIssue[] = [];

  if (normalizeShoppingListName(template.name).length === 0) errors.push({ field: 'name', message: 'Template name is required.' });
  if (!isSupportedShoppingListCurrency(template.currencyCode)) errors.push({ field: 'currencyCode', message: 'Currency code is invalid.' });
  if (!safeNonNegative(template.budgetMinor)) errors.push({ field: 'budgetMinor', message: 'Budget must be a non-negative integer.' });
  if (template.cadence.trim().length === 0) errors.push({ field: 'cadence', message: 'Cadence is required.' });
  if (!validTimestamp(template.createdAt)) errors.push({ field: 'createdAt', message: 'Created timestamp is required.' });
  if (!validTimestamp(template.updatedAt)) errors.push({ field: 'updatedAt', message: 'Updated timestamp is required.' });
  if (template.nextOccurrenceOn !== null && !validTimestamp(template.nextOccurrenceOn)) {
    errors.push({ field: 'nextOccurrenceOn', message: 'Next occurrence date must be a valid timestamp or null.' });
  }

  for (const item of template.items) {
    if (normalizeShoppingListName(item.name).length === 0) errors.push({ field: `items.${item.id}.name`, message: 'Item name is required.' });
    if (!isSupportedShoppingListUnitCode(item.unitCode)) errors.push({ field: `items.${item.id}.unitCode`, message: 'Unit code is invalid.' });
    if (!safePositive(item.quantityMilli)) errors.push({ field: `items.${item.id}.quantityMilli`, message: 'Quantity must be a positive safe integer.' });
    if (isSupportedShoppingListUnitCode(item.unitCode) && !validateShoppingListQuantity(item.unitCode, item.quantityMilli).success) {
      errors.push({ field: `items.${item.id}.quantityMilli`, message: 'Quantity is invalid for the selected unit.' });
    }
    if (!safeNonNegative(item.plannedUnitMinor)) errors.push({ field: `items.${item.id}.plannedUnitMinor`, message: 'Planned unit price must be a non-negative integer.' });
    if (!safePositive(item.sortOrder)) errors.push({ field: `items.${item.id}.sortOrder`, message: 'Sort order must be a positive integer.' });
    if (item.templateId !== template.id) errors.push({ field: `items.${item.id}.templateId`, message: 'Item template id must match the parent template.' });
  }

  return errors.length === 0 ? { success: true, value: template } : { success: false, errors };
}

export function createRecurrenceTemplateFromList(
  list: ShoppingList,
  createdAt: string,
  createId: ShoppingListIdFactory,
  options: { cadence?: string; id?: string; name?: string } = {}
): RecurrenceTemplate {
  if (list.deletedAt !== null) throw new Error('Cannot create a template from a deleted shopping list.');
  if (!validTimestamp(createdAt)) throw new Error('Template timestamp is required.');

  const id = options.id ?? createId('recurrence-template');
  const template: RecurrenceTemplate = {
    active: true,
    budgetMinor: list.budgetMinor,
    cadence: options.cadence ?? 'manual',
    createdAt,
    currencyCode: list.currencyCode,
    id,
    items: list.items
      .filter((item) => item.deletedAt === null)
      .map((item, index) => ({
        id: createId(`${id}-item`),
        name: normalizeShoppingListName(item.name),
        plannedUnitMinor: item.plannedUnitMinor,
        quantityMilli: item.quantityMilli,
        sortOrder: index + 1,
        templateId: id,
        unitCode: item.unitCode,
      })),
    name: normalizeShoppingListName(options.name ?? list.name),
    nextOccurrenceOn: null,
    sourceListId: list.id,
    updatedAt: createdAt,
  };

  const validation = validateRecurrenceTemplate(template);
  if (!validation.success) throw new Error(validation.errors.map((issue) => `${issue.field}: ${issue.message}`).join('; '));
  return template;
}

export function generateShoppingListFromTemplate(
  template: RecurrenceTemplate,
  generatedAt: string,
  createId: ShoppingListIdFactory,
  options: { id?: string; name?: string } = {}
): ShoppingList {
  if (!template.active) throw new Error('Cannot generate from an inactive template.');
  if (!validTimestamp(generatedAt)) throw new Error('Generated timestamp is required.');

  const id = options.id ?? createId('shopping-list');
  const list: ShoppingList = {
    budgetMinor: template.budgetMinor,
    createdAt: generatedAt,
    currencyCode: template.currencyCode,
    deletedAt: null,
    finalizedAt: null,
    id,
    items: template.items.map((item, index) => ({
      actualUnitMinor: null,
      createdAt: generatedAt,
      deletedAt: null,
      id: createId(`${id}-item`),
      listId: id,
      name: item.name,
      plannedUnitMinor: item.plannedUnitMinor,
      purchasedAt: null,
      quantityMilli: item.quantityMilli,
      sortOrder: index + 1,
      unitCode: item.unitCode,
      updatedAt: generatedAt,
    })),
    name: normalizeShoppingListName(options.name ?? template.name),
    status: 'draft',
    updatedAt: generatedAt,
  };

  if (list.items.length === 0) throw new Error('Cannot generate an empty shopping list.');
  return list;
}
