export type AdRequestConfiguration = {
  testDeviceIdentifiers: string[];
};

export type BannerAdRequestOptions = {
  requestNonPersonalizedAdsOnly: boolean;
};

export type BannerAdUnitSelection = {
  productionBannerAdUnitId?: string;
  shouldUseTestAds: boolean;
};

export const TEST_BANNER_AD_UNIT_ID = 'ca-app-pub-3940256099942544/6300978111';

export function resolveBannerAdUnitId({ shouldUseTestAds, productionBannerAdUnitId }: BannerAdUnitSelection): string | null {
  if (shouldUseTestAds) return TEST_BANNER_AD_UNIT_ID;
  return productionBannerAdUnitId?.trim() || null;
}

export function resolveBannerAdRequestOptions(): BannerAdRequestOptions {
  return { requestNonPersonalizedAdsOnly: true };
}

export type ResolveAdRequestConfigurationInput = {
  isDevelopment: boolean;
  testDeviceIdentifiers?: readonly string[];
};

const DEVELOPMENT_TEST_DEVICE_IDS = ['EMULATOR'];

function normalizeIdentifiers(identifiers: readonly string[]): string[] {
  return [...new Set(identifiers.map((identifier) => identifier.trim()).filter(Boolean))];
}

export function resolveAdRequestConfiguration({
  isDevelopment,
  testDeviceIdentifiers = [],
}: ResolveAdRequestConfigurationInput): AdRequestConfiguration {
  if (!isDevelopment) {
    return { testDeviceIdentifiers: [] };
  }

  return {
    testDeviceIdentifiers: normalizeIdentifiers([...DEVELOPMENT_TEST_DEVICE_IDS, ...testDeviceIdentifiers]),
  };
}
