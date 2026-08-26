import { useEffect, useState } from 'react';

import { createRecurrenceTemplateUseCases, type RecurrenceTemplateUseCases } from '@/domain/recurrence-template-use-cases';
import { createShoppingListUseCases, type ShoppingListUseCases } from '@/domain/shopping-list-use-cases';
import type { RecurrenceTemplateRepository } from '@/domain/recurrence-template-repository';
import type { ShoppingListRepository } from '@/domain/shopping-list-repository';
import { ensureSQLiteBootstrapped } from '@/lib/sqlite/bootstrap';
import { createSQLiteRecurrenceTemplateRepository } from '@/lib/sqlite/recurrence-template-repository';
import { createSQLiteShoppingListRepository } from '@/lib/sqlite/shopping-list-repository';

export type Epic06Runtime = {
  lists: ShoppingListRepository;
  listUseCases: ShoppingListUseCases;
  templates: RecurrenceTemplateRepository;
  templateUseCases: RecurrenceTemplateUseCases;
};

export async function createDefaultEpic06Runtime(): Promise<Epic06Runtime> {
  const database = await ensureSQLiteBootstrapped();
  const lists = createSQLiteShoppingListRepository(database as never);
  const templates = createSQLiteRecurrenceTemplateRepository(database as never);
  return {
    lists,
    templates,
    listUseCases: createShoppingListUseCases({ repository: lists }),
    templateUseCases: createRecurrenceTemplateUseCases({ listRepository: lists, templateRepository: templates }),
  };
}

export function useEpic06Runtime(injected?: Epic06Runtime): Epic06Runtime | null {
  const [runtime, setRuntime] = useState<Epic06Runtime | null>(injected ?? null);
  useEffect(() => {
    if (injected) return;
    let active = true;
    void createDefaultEpic06Runtime().then((value) => { if (active) setRuntime(value); }).catch(() => { if (active) setRuntime(null); });
    return () => { active = false; };
  }, [injected]);
  return runtime;
}
