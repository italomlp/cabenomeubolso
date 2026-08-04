import { describe, expect, it } from '@jest/globals';

import {
  GOOGLE_MOBILE_ADS_TEST_APP_IDS,
  GOOGLE_MOBILE_ADS_USER_TRACKING_USAGE_DESCRIPTION,
  createAdMobPluginConfig,
} from './admob';

describe('AdMob app config', () => {
  it('uses the public Google test App IDs and no production identifiers', () => {
    const config = createAdMobPluginConfig();

    expect(config).toEqual({
      androidAppId: GOOGLE_MOBILE_ADS_TEST_APP_IDS.android,
      delayAppMeasurementInit: true,
      iosAppId: GOOGLE_MOBILE_ADS_TEST_APP_IDS.ios,
      userTrackingUsageDescription: GOOGLE_MOBILE_ADS_USER_TRACKING_USAGE_DESCRIPTION,
    });
    expect(config.androidAppId).toContain('3940256099942544');
    expect(config.iosAppId).toContain('3940256099942544');
  });
});
