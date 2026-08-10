import { createShoppingListUseCases, type ShoppingListUseCases } from '@/domain/shopping-list-use-cases';
import type { ShoppingListRepository } from '@/domain/shopping-list-repository';
import { ensureSQLiteBootstrapped } from '@/lib/sqlite/bootstrap';
import { createSQLiteShoppingListRepository } from '@/lib/sqlite/shopping-list-repository';
import { useEffect, useState } from 'react';

export type PlanningRuntime = {
  repository: Pick<ShoppingListRepository, 'get' | 'list' | 'save'>;
  useCases: Pick<ShoppingListUseCases, 'finalizeList' | 'loadList' | 'reopenList' | 'saveList'>;
};

export async function createDefaultPlanningRuntime(): Promise<PlanningRuntime> {
  const database = await ensureSQLiteBootstrapped();
  const repository = createSQLiteShoppingListRepository(database as never);
  const useCases = createShoppingListUseCases({ repository });

  return { repository, useCases };
}

export function usePlanningRuntime(dependencies?: PlanningRuntime): PlanningRuntime | null {
  const [bootstrappedRuntime, setBootstrappedRuntime] = useState<PlanningRuntime | null>(null);

  useEffect(() => {
    if (dependencies !== undefined) {
      return;
    }

    let isActive = true;

    void createDefaultPlanningRuntime().then((nextRuntime) => {
      if (isActive) {
        setBootstrappedRuntime(nextRuntime);
      }
    }).catch(() => {
      if (isActive) {
        setBootstrappedRuntime(null);
      }
    });

    return () => {
      isActive = false;
    };
  }, [dependencies]);

  return dependencies ?? bootstrappedRuntime;
}
