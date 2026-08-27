export type AdaptiveBannerPlacement = 'home-list-content' | 'finalized-summary';

type AdBannerProps = {
  placement: AdaptiveBannerPlacement;
  advertisementLabel: string;
  shouldUseTestAds: boolean;
  productionBannerAdUnitId?: string;
};

/** The only adapter allowed to know about the native banner control and sizes. */
// Native implementations live in platform adapters. Keeping the generic adapter
// inert also lets the feature tree be rendered in Jest/Expo Go without loading
// the native ads TurboModule.
export function AdBanner(_props: AdBannerProps) {
  return null;
}
