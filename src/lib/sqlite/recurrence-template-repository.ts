import {
  validateRecurrenceTemplate,
  type RecurrenceTemplate,
  type RecurrenceTemplateItem,
} from '@/domain/recurrence-template';
import { normalizeShoppingListName } from '@/domain/shopping-list';
import type { RecurrenceTemplateRepository } from '@/domain/recurrence-template-repository';

export type SQLiteRecurrenceTemplateDatabase = {
  getAllAsync: <T>(sql: string, ...params: readonly unknown[]) => Promise<readonly T[]>;
  getFirstAsync: <T>(sql: string, ...params: readonly unknown[]) => Promise<T | undefined>;
  runAsync: (sql: string, ...params: readonly unknown[]) => Promise<unknown>;
  withExclusiveTransactionAsync?: (task: (database: SQLiteRecurrenceTemplateDatabase) => Promise<void>) => Promise<void>;
  withTransactionAsync: (task: (database: SQLiteRecurrenceTemplateDatabase) => Promise<void>) => Promise<void>;
};

type TemplateRow = {
  active: number;
  budget_minor: number;
  cadence: string;
  created_at: string;
  currency_code: string;
  id: string;
  name: string;
  next_occurrence_on: string | null;
  source_list_id: string | null;
  updated_at: string;
};

type TemplateItemRow = {
  id: string;
  name: string;
  planned_unit_minor: number;
  quantity_milli: number;
  sort_order: number;
  template_id: string;
  unit_code: string;
};

const templateSelect = `SELECT id, source_list_id, name, currency_code, budget_minor, cadence,
  next_occurrence_on, active, created_at, updated_at FROM recurrence_templates`;
const itemSelect = `SELECT id, template_id, name, unit_code, quantity_milli, planned_unit_minor, sort_order
  FROM template_items`;

function mapTemplate(row: TemplateRow, itemRows: readonly TemplateItemRow[]): RecurrenceTemplate {
  const template = {
    active: row.active === 1,
    budgetMinor: row.budget_minor,
    cadence: row.cadence,
    createdAt: row.created_at,
    currencyCode: row.currency_code as RecurrenceTemplate['currencyCode'],
    id: row.id,
    items: itemRows.map((item): RecurrenceTemplateItem => ({
      id: item.id,
      name: normalizeShoppingListName(item.name),
      plannedUnitMinor: item.planned_unit_minor,
      quantityMilli: item.quantity_milli,
      sortOrder: item.sort_order,
      templateId: item.template_id,
      unitCode: item.unit_code as RecurrenceTemplateItem['unitCode'],
    })),
    name: normalizeShoppingListName(row.name),
    nextOccurrenceOn: row.next_occurrence_on,
    sourceListId: row.source_list_id,
    updatedAt: row.updated_at,
  };
  const validation = validateRecurrenceTemplate(template);
  if (!validation.success) throw new Error(validation.errors.map((issue) => `${issue.field}: ${issue.message}`).join('; '));
  return template;
}

async function withTransaction(database: SQLiteRecurrenceTemplateDatabase, task: (database: SQLiteRecurrenceTemplateDatabase) => Promise<void>) {
  if (database.withExclusiveTransactionAsync !== undefined) {
    await database.withExclusiveTransactionAsync(task);
  } else {
    await database.withTransactionAsync(task);
  }
}

async function loadTemplate(database: SQLiteRecurrenceTemplateDatabase, id: string): Promise<RecurrenceTemplate | null> {
  const row = await database.getFirstAsync<TemplateRow>(`${templateSelect} WHERE id = ?`, id);
  if (row === undefined) return null;
  const items = await database.getAllAsync<TemplateItemRow>(`${itemSelect} WHERE template_id = ? ORDER BY sort_order, id`, id);
  return mapTemplate(row, items);
}

export function createSQLiteRecurrenceTemplateRepository(database: SQLiteRecurrenceTemplateDatabase): RecurrenceTemplateRepository {
  return {
    get: (id) => loadTemplate(database, id),
    list: async (includeInactive = false) => {
      const rows = await database.getAllAsync<TemplateRow>(`${templateSelect}${includeInactive ? '' : ' WHERE active = 1'} ORDER BY updated_at DESC, id DESC`);
      return Promise.all(rows.map(async (row) => mapTemplate(row, await database.getAllAsync<TemplateItemRow>(`${itemSelect} WHERE template_id = ? ORDER BY sort_order, id`, row.id))));
    },
    save: async (template) => {
      const normalized = { ...template, name: normalizeShoppingListName(template.name), items: template.items.map((item) => ({ ...item, name: normalizeShoppingListName(item.name) })) };
      const validation = validateRecurrenceTemplate(normalized);
      if (!validation.success) throw new Error(validation.errors.map((issue) => `${issue.field}: ${issue.message}`).join('; '));
      await withTransaction(database, async (transaction) => {
        await transaction.runAsync(
          `INSERT INTO recurrence_templates (id, source_list_id, name, currency_code, budget_minor, cadence, next_occurrence_on, active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET source_list_id = excluded.source_list_id, name = excluded.name,
           currency_code = excluded.currency_code, budget_minor = excluded.budget_minor, cadence = excluded.cadence,
           next_occurrence_on = excluded.next_occurrence_on, active = excluded.active, created_at = excluded.created_at,
           updated_at = excluded.updated_at`,
          normalized.id, normalized.sourceListId, normalized.name, normalized.currencyCode, normalized.budgetMinor,
          normalized.cadence, normalized.nextOccurrenceOn, normalized.active ? 1 : 0, normalized.createdAt, normalized.updatedAt
        );
        const retainedItemIds = normalized.items.map(() => '?').join(', ');
        await transaction.runAsync(
          `DELETE FROM template_items WHERE template_id = ?${retainedItemIds.length > 0 ? ` AND id NOT IN (${retainedItemIds})` : ''}`,
          normalized.id,
          ...normalized.items.map((item) => item.id)
        );
        for (const item of normalized.items) {
          await transaction.runAsync(
            `INSERT INTO template_items (id, template_id, name, unit_code, quantity_milli, planned_unit_minor, sort_order, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET template_id = excluded.template_id, name = excluded.name,
             unit_code = excluded.unit_code, quantity_milli = excluded.quantity_milli, planned_unit_minor = excluded.planned_unit_minor,
             sort_order = excluded.sort_order, created_at = excluded.created_at, updated_at = excluded.updated_at`,
            item.id, item.templateId, item.name, item.unitCode, item.quantityMilli, item.plannedUnitMinor,
            item.sortOrder, normalized.createdAt, normalized.updatedAt
          );
        }
      });
    },
    permanentlyDelete: async (id) => withTransaction(database, async (transaction) => {
      await transaction.runAsync('DELETE FROM recurrence_templates WHERE id = ?', id);
    }),
  };
}
