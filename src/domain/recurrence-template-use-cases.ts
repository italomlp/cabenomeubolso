import { createRecurrenceTemplateFromList, generateShoppingListFromTemplate, validateRecurrenceTemplate, type RecurrenceTemplate } from './recurrence-template';
import type { RecurrenceTemplateRepository } from './recurrence-template-repository';
import type { ShoppingListRepository } from './shopping-list-repository';
import type { ShoppingList, ShoppingListIdFactory } from './shopping-list';

export type RecurrenceTemplateUseCaseDependencies = {
  createId?: ShoppingListIdFactory;
  listRepository: ShoppingListRepository;
  now?: () => string;
  templateRepository: RecurrenceTemplateRepository;
};

export type RecurrenceTemplateUseCases = {
  createFromList: (listId: string, options?: { cadence?: string; name?: string }) => Promise<RecurrenceTemplate>;
  generateNow: (templateId: string, options?: { name?: string }) => Promise<ShoppingList>;
  listTemplates: () => Promise<readonly RecurrenceTemplate[]>;
  saveTemplate: (template: RecurrenceTemplate) => Promise<void>;
  deleteTemplate: (templateId: string, confirmed: boolean) => Promise<void>;
};

let idSequence = 0;
const defaultCreateId: ShoppingListIdFactory = (prefix) => `${prefix}-${Date.now().toString(36)}-${++idSequence}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

export function createRecurrenceTemplateUseCases({
  createId = defaultCreateId,
  listRepository,
  now = () => new Date().toISOString(),
  templateRepository,
}: RecurrenceTemplateUseCaseDependencies): RecurrenceTemplateUseCases {
  return {
    createFromList: async (listId, options = {}) => {
      const list = await listRepository.get(listId);
      if (list === null) throw new Error(`Shopping list not found: ${listId}`);
      const template = createRecurrenceTemplateFromList(list, now(), createId, options);
      await templateRepository.save(template);
      return template;
    },
    generateNow: async (templateId, options = {}) => {
      const template = await templateRepository.get(templateId);
      if (template === null) throw new Error(`Recurrence template not found: ${templateId}`);
      const list = generateShoppingListFromTemplate(template, now(), createId, options);
      await listRepository.save(list);
      return list;
    },
    listTemplates: () => templateRepository.list(),
    saveTemplate: async (template) => {
      const validation = validateRecurrenceTemplate(template);
      if (!validation.success) throw new Error(validation.errors.map((issue) => `${issue.field}: ${issue.message}`).join('; '));
      await templateRepository.save(template);
    },
    deleteTemplate: async (templateId, confirmed) => {
      if (!confirmed) throw new Error('Confirmation is required to permanently delete a template.');
      await templateRepository.permanentlyDelete(templateId);
    },
  };
}
