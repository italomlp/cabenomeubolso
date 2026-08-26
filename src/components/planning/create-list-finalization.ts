import type { CreateListDraftState } from '@/app/home-state';

export function hasUnpurchasedPlannedItems(items: readonly Pick<CreateListDraftState['items'][number], 'deletedAt' | 'purchasedAt'>[]) {
  return items.some((item) => item.deletedAt === null && item.purchasedAt === null);
}
