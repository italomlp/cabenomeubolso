import { useEffect, useMemo, useState } from 'react';

import type { AdService, AdSlotEligibility } from '@/lib/ads/ad-service';

import { AdBanner, type AdaptiveBannerPlacement } from './ad-banner';
import { AdSlot } from './ad-slot';

type AdPlacementProps = {
  placement: AdaptiveBannerPlacement;
  service?: AdService;
};

const disabledEligibility: AdSlotEligibility = {
  canRender: false,
  consentInfo: null,
  privacyOptionsRequired: false,
  releaseEnabled: false,
  reason: 'disabled-by-flag',
  shouldUseTestAds: false,
};

export function AdPlacement({ placement, service: providedService }: AdPlacementProps) {
  const service = useMemo(() => {
    if (providedService) return providedService;

    // Keep native SDK loading behind this adapter. A JS-only runtime (Jest or
    // Expo Go) falls back to the same disabled state as the release flag.
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('@/lib/ads/ad-service').createAdService() as AdService;
    } catch {
      return {
        getSnapshot: () => ({ eligibility: disabledEligibility, initialized: false, trackingAuthorizationStatus: null }),
        prepare: async () => ({ eligibility: disabledEligibility, initialized: false, trackingAuthorizationStatus: null }),
        requestPrivacyOptions: async () => ({ eligibility: disabledEligibility, initialized: false, trackingAuthorizationStatus: null }),
      } satisfies AdService;
    }
  }, [providedService]);
  const [eligibility, setEligibility] = useState<AdSlotEligibility>(
    () => service.getSnapshot()?.eligibility ?? disabledEligibility
  );

  useEffect(() => {
    let active = true;
    void service.prepare().then((snapshot) => {
      if (active) setEligibility(snapshot.eligibility);
    });
    return () => {
      active = false;
    };
  }, [service]);

  return <AdSlot eligibility={eligibility}><AdBanner placement={placement} /></AdSlot>;
}
