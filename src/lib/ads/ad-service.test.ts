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
  it('keeps iOS as a no-op boundary even when ads are enabled elsewhere', async () => {
    const gatherConsent = jest.fn();
    const getConsentInfo = jest.fn();
    const showPrivacyOptionsForm = jest.fn();
    const setRequestConfiguration = jest.fn(async (_configuration: { testDeviceIdentifiers: string[] }) => undefined);
    const initialize = jest.fn(async () => [] as never[]);
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
    });

    expect(DEFAULT_ADS_RELEASE_FLAG).toBe(false);

    const snapshot = await service.prepare();
    const privacySnapshot = await service.requestPrivacyOptions();

    expect(snapshot.eligibility).toEqual(
      expect.objectContaining({
        canRender: false,
        reason: 'disabled-by-flag',
        releaseEnabled: false,
        shouldUseTestAds: false,
      })
    );
    expect(privacySnapshot).toBe(snapshot);
    expect(gatherConsent).not.toHaveBeenCalled();
    expect(getConsentInfo).not.toHaveBeenCalled();
    expect(showPrivacyOptionsForm).not.toHaveBeenCalled();
    expect(setRequestConfiguration).not.toHaveBeenCalled();
    expect(initialize).not.toHaveBeenCalled();
  });

  it('waits for consent before configuring requests on Android and uses test devices in development', async () => {
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
    const service = createAdService({
      adsConsent: {
        gatherConsent,
        getConsentInfo,
        showPrivacyOptionsForm,
      } as unknown as AdServiceDependencies['adsConsent'],
      isDevelopment: true,
      mobileAdsFactory: (() => ({ initialize, setRequestConfiguration })) as unknown as AdServiceDependencies['mobileAdsFactory'],
      platformOS: 'android',
      releaseEnabled: true,
      testDeviceIdentifiers: ['custom-device', 'EMULATOR'],
    });

    const snapshot = await service.prepare();

    expect(calls).toEqual(['consent', 'request-configuration', 'initialize']);
    expect(gatherConsent).toHaveBeenCalledWith({ testDeviceIdentifiers: ['EMULATOR', 'custom-device'] });
    expect(setRequestConfiguration).toHaveBeenCalledWith({ testDeviceIdentifiers: ['EMULATOR', 'custom-device'] });
    expect(getConsentInfo).not.toHaveBeenCalled();
    expect(showPrivacyOptionsForm).not.toHaveBeenCalled();
    expect(initialize).toHaveBeenCalledTimes(1);
    expect(snapshot.eligibility).toEqual(
      expect.objectContaining({ canRender: true, reason: 'ready', shouldUseTestAds: true })
    );
    expect(snapshot.trackingAuthorizationStatus).toBeNull();
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
      platformOS: 'android',
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
