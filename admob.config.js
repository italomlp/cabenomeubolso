const GOOGLE_MOBILE_ADS_TEST_APP_IDS = {
  android: 'ca-app-pub-3940256099942544~3347511713',
  ios: 'ca-app-pub-3940256099942544~1458002511',
};

const GOOGLE_MOBILE_ADS_USER_TRACKING_USAGE_DESCRIPTION =
  'This identifier will be used to deliver personalized ads to you.';

function createAdMobPluginConfig() {
  return {
    androidAppId: GOOGLE_MOBILE_ADS_TEST_APP_IDS.android,
    delayAppMeasurementInit: true,
    iosAppId: GOOGLE_MOBILE_ADS_TEST_APP_IDS.ios,
    userTrackingUsageDescription: GOOGLE_MOBILE_ADS_USER_TRACKING_USAGE_DESCRIPTION,
  };
}

module.exports = {
  GOOGLE_MOBILE_ADS_TEST_APP_IDS,
  GOOGLE_MOBILE_ADS_USER_TRACKING_USAGE_DESCRIPTION,
  createAdMobPluginConfig,
};
