import { useEffect, useState } from 'react';

import type { AdService, AdSlotEligibility } from '@/lib/ads/ad-service';

import { AdBanner, type AdaptiveBannerPlacement } from './ad-banner';
import { AdSlot } from './ad-slot';

type AdPlacementProps = {
  placement: AdaptiveBannerPlacement;
  advertisementLabel: string;
  service?: AdService;
  productionBannerAdUnitId?: string;
};

const sharedService: { value: AdService | null } = { value: null };

const disabledEligibility: AdSlotEligibility = {
  canRender: false,
  consentInfo: null,
  privacyOptionsRequired: false,
  releaseEnabled: false,
  reason: 'disabled-by-flag',
  shouldUseTestAds: false,
};

const disabledService: AdService = {
  getSnapshot: () => ({ eligibility: disabledEligibility, initialized: false, trackingAuthorizationStatus: null }),
  prepare: async () => ({ eligibility: disabledEligibility, initialized: false, trackingAuthorizationStatus: null }),
  requestPrivacyOptions: async () => ({ eligibility: disabledEligibility, initialized: false, trackingAuthorizationStatus: null }),
};

export function AdPlacement({ placement, advertisementLabel, service: providedService, productionBannerAdUnitId }: AdPlacementProps) {
  const [service, setService] = useState<AdService>(providedService ?? disabledService);
  const [eligibility, setEligibility] = useState<AdSlotEligibility>(
    () => service.getSnapshot()?.eligibility ?? disabledEligibility
  );

  useEffect(() => {
    let active = true;
    if (providedService) {
      void providedService.prepare().then((snapshot) => {
        if (active) setEligibility(snapshot.eligibility);
      });
      return () => { active = false; };
    }

    // Create the default once, outside render. A JS-only runtime (Jest or
    // Expo Go) falls back to the same disabled state as the release flag.
    try {
      if (!sharedService.value) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        sharedService.value = require('@/lib/ads/ad-service').createAdService() as AdService;
      }
      const nextService = sharedService.value;
      queueMicrotask(() => {
        if (active) setService(nextService);
      });
      void nextService.prepare().then((snapshot) => {
        if (active) setEligibility(snapshot.eligibility);
      });
    } catch {
      sharedService.value = disabledService;
      queueMicrotask(() => {
        if (active) setService(disabledService);
      });
    }
    return () => {
      active = false;
    };
  }, [providedService]);

  return <AdSlot eligibility={eligibility}><AdBanner advertisementLabel={advertisementLabel} placement={placement} productionBannerAdUnitId={productionBannerAdUnitId} shouldUseTestAds={eligibility.shouldUseTestAds} /></AdSlot>;
}
