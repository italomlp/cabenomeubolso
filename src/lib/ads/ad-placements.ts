export type AdPlacementScreen = 'home' | 'planning' | 'active-shopping' | 'summary';

export type AllowedAdPlacement = 'home-list-content' | 'finalized-summary';

export function resolveAllowedAdPlacement(
  screen: AdPlacementScreen,
  listStatus?: 'draft' | 'active' | 'finalized'
): AllowedAdPlacement | null {
  if (screen === 'home') return 'home-list-content';
  if (screen === 'summary' && listStatus === 'finalized') return 'finalized-summary';
  return null;
}
