import { describe, expect, it } from '@jest/globals';

import appConfig from './app.config';

describe('app config', () => {
  it('evaluates in Node and wires the AdMob plugin with safe public values', () => {
    const result = appConfig({
      config: {
        name: 'Cabe no Meu Bolso',
        plugins: ['expo-router'],
      },
    });

    expect(result.plugins).toEqual([
      'expo-router',
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: 'ca-app-pub-3940256099942544~3347511713',
          delayAppMeasurementInit: true,
          iosAppId: 'ca-app-pub-3940256099942544~1458002511',
          userTrackingUsageDescription: 'This identifier will be used to deliver personalized ads to you.',
        },
      ],
    ]);
  });
});
