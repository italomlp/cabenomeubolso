import type { RecurrenceTemplate } from './recurrence-template';

export type RecurrenceTemplateRepository = {
  get: (id: string) => Promise<RecurrenceTemplate | null>;
  list: (includeInactive?: boolean) => Promise<readonly RecurrenceTemplate[]>;
  save: (template: RecurrenceTemplate) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
};
