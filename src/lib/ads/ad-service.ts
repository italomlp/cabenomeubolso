import { Platform } from 'react-native';
import {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  type AdsConsentInfo,
  type AdsConsentInfoOptions,
} from 'react-native-google-mobile-ads';
import mobileAds from 'react-native-google-mobile-ads';

import { resolveAdRequestConfiguration } from './ad-request-configuration';

export const DEFAULT_ADS_RELEASE_FLAG = false;

export type AdEligibilityReason = 'disabled-by-flag' | 'consent-required' | 'privacy-options-required' | 'ready';

export type AdSlotEligibility = {
  canRender: boolean;
  consentInfo: AdsConsentInfo | null;
  privacyOptionsRequired: boolean;
  releaseEnabled: boolean;
  reason: AdEligibilityReason;
  shouldUseTestAds: boolean;
};

export type AdServiceSnapshot = {
  eligibility: AdSlotEligibility;
  initialized: boolean;
  trackingAuthorizationStatus: null;
};

type AdsConsentClient = Pick<
  typeof AdsConsent,
  'gatherConsent' | 'getConsentInfo' | 'showPrivacyOptionsForm'
>;

type AdServiceDependencies = {
  adsConsent?: AdsConsentClient;
  consentOptions?: AdsConsentInfoOptions;
  isDevelopment?: boolean;
  mobileAdsFactory?: typeof mobileAds;
  platformOS?: typeof Platform.OS;
  releaseEnabled?: boolean;
  testDeviceIdentifiers?: readonly string[];
};

type AdService = {
  prepare: () => Promise<AdServiceSnapshot>;
  requestPrivacyOptions: () => Promise<AdServiceSnapshot>;
  getSnapshot: () => AdServiceSnapshot | null;
};

function createDisabledSnapshot(): AdServiceSnapshot {
  return createSnapshot(
    {
      canRender: false,
      consentInfo: null,
      privacyOptionsRequired: false,
      releaseEnabled: false,
      reason: 'disabled-by-flag',
      shouldUseTestAds: false,
    },
    null
  );
}

function buildEligibility({
  consentInfo,
  isDevelopment,
  releaseEnabled,
}: {
  consentInfo: AdsConsentInfo | null;
  isDevelopment: boolean;
  releaseEnabled: boolean;
}): AdSlotEligibility {
  if (!releaseEnabled) {
    return {
      canRender: false,
      consentInfo,
      privacyOptionsRequired: false,
      releaseEnabled,
      reason: 'disabled-by-flag',
      shouldUseTestAds: false,
    };
  }

  if (consentInfo === null || !consentInfo.canRequestAds) {
    const privacyOptionsRequired =
      consentInfo?.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;

    return {
      canRender: false,
      consentInfo,
      privacyOptionsRequired,
      releaseEnabled,
      reason: privacyOptionsRequired ? 'privacy-options-required' : 'consent-required',
      shouldUseTestAds: isDevelopment,
    };
  }

  return {
    canRender: true,
    consentInfo,
    privacyOptionsRequired:
      consentInfo.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
    releaseEnabled,
    reason: 'ready',
    shouldUseTestAds: isDevelopment,
  };
}

function createSnapshot(eligibility: AdSlotEligibility, trackingAuthorizationStatus: null): AdServiceSnapshot {
  return {
    eligibility,
    initialized: eligibility.canRender,
    trackingAuthorizationStatus,
  };
}

export function createAdService(dependencies: AdServiceDependencies = {}): AdService {
  const isDevelopment = dependencies.isDevelopment ?? __DEV__;
  const platformOS = dependencies.platformOS ?? Platform.OS;
  const releaseEnabled = dependencies.releaseEnabled ?? DEFAULT_ADS_RELEASE_FLAG;

  let snapshot: AdServiceSnapshot | null = null;

  if (platformOS === 'ios') {
    const disabledSnapshot = createDisabledSnapshot();
    snapshot = disabledSnapshot;

    return {
      getSnapshot: () => snapshot,
      prepare: async () => disabledSnapshot,
      requestPrivacyOptions: async () => disabledSnapshot,
    };
  }

  const adsConsent = dependencies.adsConsent ?? AdsConsent;
  const mobileAdsClientFactory = dependencies.mobileAdsFactory ?? mobileAds;
  const testDeviceIdentifiers = dependencies.testDeviceIdentifiers ?? [];

  const markSnapshot = (consentInfo: AdsConsentInfo | null): AdServiceSnapshot => {
    const eligibility = buildEligibility({ consentInfo, isDevelopment, releaseEnabled });
    snapshot = createSnapshot(eligibility, null);
    return snapshot;
  };

  const initialize = async (): Promise<AdServiceSnapshot> => {
    if (!releaseEnabled) {
      return markSnapshot(null);
    }

    let consentInfo: AdsConsentInfo;

    try {
      consentInfo = await adsConsent.gatherConsent({
        ...dependencies.consentOptions,
        testDeviceIdentifiers: resolveAdRequestConfiguration({
          isDevelopment,
          testDeviceIdentifiers,
        }).testDeviceIdentifiers,
      });
    } catch {
      consentInfo = await adsConsent.getConsentInfo();
    }

    if (consentInfo.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED) {
      consentInfo = await adsConsent.showPrivacyOptionsForm();
    }

    if (!consentInfo.canRequestAds) {
      return markSnapshot(consentInfo);
    }

    const requestConfiguration = resolveAdRequestConfiguration({
      isDevelopment,
      testDeviceIdentifiers,
    });

    const mobileAdsClient = mobileAdsClientFactory();

    await mobileAdsClient.setRequestConfiguration(requestConfiguration);

    await mobileAdsClient.initialize();

    return markSnapshot(consentInfo);
  };

  return {
    getSnapshot: () => snapshot,
    prepare: initialize,
    requestPrivacyOptions: async () => {
      if (!releaseEnabled) {
        return markSnapshot(null);
      }

      const consentInfo = await adsConsent.getConsentInfo();

      if (consentInfo.privacyOptionsRequirementStatus !== AdsConsentPrivacyOptionsRequirementStatus.REQUIRED) {
        return markSnapshot(consentInfo);
      }

      const updatedConsentInfo = await adsConsent.showPrivacyOptionsForm();
      return markSnapshot(updatedConsentInfo);
    },
  };
}

export { buildEligibility as resolveAdSlotEligibility };
