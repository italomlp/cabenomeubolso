import { describe, expect, it, jest } from '@jest/globals';

import { AdsConsentPrivacyOptionsRequirementStatus, type AdsConsentInfo } from 'react-native-google-mobile-ads';
import { createAdService, DEFAULT_ADS_RELEASE_FLAG, resolveAdSlotEligibility } from './ad-service';
import { resolveAdRequestConfiguration } from './ad-request-configuration';

jest.mock('react-native-google-mobile-ads', () => ({
  AdsConsent: {
    gatherConsent: jest.fn(),
    getConsentInfo: jest.fn(),
    showPrivacyOptionsForm: jest.fn(),
  },
  AdsConsentPrivacyOptionsRequirementStatus: {
    NOT_REQUIRED: 'NOT_REQUIRED',
    REQUIRED: 'REQUIRED',
  },
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./ios-tracking', () => ({
  __esModule: true,
  requestIosTrackingAuthorization: jest.fn(async () => 'granted'),
}));

type AdServiceDependencies = NonNullable<Parameters<typeof createAdService>[0]>;

function createConsentInfo(overrides: Partial<AdsConsentInfo> = {}): AdsConsentInfo {
  return {
    canRequestAds: true,
    isConsentFormAvailable: true,
    privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.NOT_REQUIRED,
    status: 'OBTAINED' as AdsConsentInfo['status'],
    ...overrides,
  };
}

describe('ad service', () => {
  it('defaults the release flag off and keeps disabled state side-effect free', async () => {
    const gatherConsent = jest.fn();
    const getConsentInfo = jest.fn();
    const showPrivacyOptionsForm = jest.fn();
    const setRequestConfiguration = jest.fn(async (_configuration: { testDeviceIdentifiers: string[] }) => undefined);
    const initialize = jest.fn(async () => [] as never[]);
    const requestTrackingAuthorization = jest.fn();
    const service = createAdService({
      adsConsent: {
        gatherConsent,
        getConsentInfo,
        showPrivacyOptionsForm,
      } as unknown as AdServiceDependencies['adsConsent'],
      isDevelopment: true,
      mobileAdsFactory: (() => ({ initialize, setRequestConfiguration })) as unknown as AdServiceDependencies['mobileAdsFactory'],
      platformOS: 'ios',
      requestTrackingAuthorization: requestTrackingAuthorization as unknown as AdServiceDependencies['requestTrackingAuthorization'],
    });

    expect(DEFAULT_ADS_RELEASE_FLAG).toBe(false);

    const snapshot = await service.prepare();

    expect(snapshot.eligibility).toEqual(
      expect.objectContaining({
        canRender: false,
        reason: 'disabled-by-flag',
        releaseEnabled: false,
        shouldUseTestAds: false,
      })
    );
    expect(gatherConsent).not.toHaveBeenCalled();
    expect(getConsentInfo).not.toHaveBeenCalled();
    expect(showPrivacyOptionsForm).not.toHaveBeenCalled();
    expect(setRequestConfiguration).not.toHaveBeenCalled();
    expect(requestTrackingAuthorization).not.toHaveBeenCalled();
    expect(initialize).not.toHaveBeenCalled();
  });

  it('waits for consent before configuring requests, requests ATT only on iOS, and uses test devices in development', async () => {
    const calls: string[] = [];
    const consentInfo = createConsentInfo();
    const gatherConsent = jest.fn(async () => {
      calls.push('consent');
      return consentInfo;
    });
    const getConsentInfo = jest.fn();
    const showPrivacyOptionsForm = jest.fn();
    const setRequestConfiguration = jest.fn(async () => {
      calls.push('request-configuration');
    });
    const initialize = jest.fn(async () => {
      calls.push('initialize');
      return [];
    });
    const requestTrackingAuthorization = jest.fn(async () => {
      calls.push('att');
      return 'granted' as const;
    });
    const service = createAdService({
      adsConsent: {
        gatherConsent,
        getConsentInfo,
        showPrivacyOptionsForm,
      } as unknown as AdServiceDependencies['adsConsent'],
      isDevelopment: true,
      mobileAdsFactory: (() => ({ initialize, setRequestConfiguration })) as unknown as AdServiceDependencies['mobileAdsFactory'],
      platformOS: 'ios',
      releaseEnabled: true,
      requestTrackingAuthorization: requestTrackingAuthorization as unknown as AdServiceDependencies['requestTrackingAuthorization'],
      testDeviceIdentifiers: ['custom-device', 'EMULATOR'],
    });

    const snapshot = await service.prepare();

    expect(calls).toEqual(['consent', 'request-configuration', 'att', 'initialize']);
    expect(gatherConsent).toHaveBeenCalledWith({ testDeviceIdentifiers: ['EMULATOR', 'custom-device'] });
    expect(setRequestConfiguration).toHaveBeenCalledWith({ testDeviceIdentifiers: ['EMULATOR', 'custom-device'] });
    expect(getConsentInfo).not.toHaveBeenCalled();
    expect(showPrivacyOptionsForm).not.toHaveBeenCalled();
    expect(requestTrackingAuthorization).toHaveBeenCalledTimes(1);
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(snapshot.eligibility).toEqual(
      expect.objectContaining({ canRender: true, reason: 'ready', shouldUseTestAds: true })
    );
    expect(snapshot.trackingAuthorizationStatus).toBe('granted');
  });

  it('surfaces privacy options before initialization when required', async () => {
    const gatherConsent = jest.fn(async () =>
      createConsentInfo({
        canRequestAds: false,
        privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
      })
    );
    const getConsentInfo = jest.fn();
    const showPrivacyOptionsForm = jest.fn(async () =>
      createConsentInfo({
        canRequestAds: true,
        privacyOptionsRequirementStatus: AdsConsentPrivacyOptionsRequirementStatus.NOT_REQUIRED,
      })
    );
    const setRequestConfiguration = jest.fn(async (_configuration: { testDeviceIdentifiers: string[] }) => undefined);
    const initialize = jest.fn(async () => [] as never[]);
    const service = createAdService({
      adsConsent: {
        gatherConsent,
        getConsentInfo,
        showPrivacyOptionsForm,
      } as unknown as AdServiceDependencies['adsConsent'],
      isDevelopment: false,
      mobileAdsFactory: (() => ({ initialize, setRequestConfiguration })) as unknown as AdServiceDependencies['mobileAdsFactory'],
      releaseEnabled: true,
    });

    const snapshot = await service.prepare();

    expect(gatherConsent).toHaveBeenCalledTimes(1);
    expect(showPrivacyOptionsForm).toHaveBeenCalledTimes(1);
    expect(setRequestConfiguration).toHaveBeenCalledWith({ testDeviceIdentifiers: [] });
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(snapshot.eligibility).toEqual(
      expect.objectContaining({ canRender: true, privacyOptionsRequired: false, reason: 'ready' })
    );
  });

  it('keeps the eligibility boundary pure', () => {
    expect(
      resolveAdSlotEligibility({
        consentInfo: createConsentInfo({ canRequestAds: false }),
        isDevelopment: false,
        releaseEnabled: true,
      })
    ).toEqual(
      expect.objectContaining({
        canRender: false,
        reason: 'consent-required',
        shouldUseTestAds: false,
      })
    );

    expect(
      resolveAdRequestConfiguration({ isDevelopment: false, testDeviceIdentifiers: ['EMULATOR'] })
    ).toEqual({ testDeviceIdentifiers: [] });
    expect(
      resolveAdRequestConfiguration({ isDevelopment: true, testDeviceIdentifiers: ['EMULATOR', 'qa-device'] })
    ).toEqual({ testDeviceIdentifiers: ['EMULATOR', 'qa-device'] });
  });
});
