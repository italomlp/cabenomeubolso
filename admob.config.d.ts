export declare const GOOGLE_MOBILE_ADS_TEST_APP_IDS: Readonly<{
  android: 'ca-app-pub-3940256099942544~3347511713';
  ios: 'ca-app-pub-3940256099942544~1458002511';
}>;

export declare const GOOGLE_MOBILE_ADS_USER_TRACKING_USAGE_DESCRIPTION: 'This identifier will be used to deliver personalized ads to you.';

export type AdMobPluginConfig = Readonly<{
  androidAppId: string;
  delayAppMeasurementInit: true;
  iosAppId: string;
  userTrackingUsageDescription: string;
}>;

export declare function createAdMobPluginConfig(): AdMobPluginConfig;
