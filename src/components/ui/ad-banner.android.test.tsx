import { describe, expect, it, jest } from '@jest/globals';
import renderer, { act } from 'react-test-renderer';

jest.mock('react-native-google-mobile-ads', () => ({
  BannerAd: 'mock-banner-ad',
  BannerAdSize: { INLINE_ADAPTIVE_BANNER: 'inline-adaptive' },
  TestIds: { BANNER: 'test-banner' },
}));
jest.mock('@/design-system/theme-context', () => ({
  useAppTheme: () => ({ colors: { border: '#000', surfaceRaised: '#fff' } }),
}));

// The adapter must be imported after the native module mock is installed.
// eslint-disable-next-line import/first
import { AdBanner } from './ad-banner.android';

describe('Android AdBanner', () => {
  it('uses inline adaptive format for the Home banner in scrolling content', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<AdBanner advertisementLabel="Advertisement" placement="home-list-content" shouldUseTestAds />);
    });

    const banner = tree!.root.findAll((node) => String(node.type) === 'mock-banner-ad')[0];
    expect(banner?.props.size).toBe('inline-adaptive');
    expect(banner?.props.unitId).toBe('ca-app-pub-3940256099942544/6300978111');
    expect(banner?.props.requestOptions).toEqual({ requestNonPersonalizedAdsOnly: true });
  });

  it('uses the supplied production unit when test ads are not eligible', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<AdBanner advertisementLabel="Advertisement" placement="finalized-summary" productionBannerAdUnitId="prod-banner" shouldUseTestAds={false} />);
    });

    const banner = tree!.root.findAll((node) => String(node.type) === 'mock-banner-ad')[0];
    expect(banner?.props.unitId).toBe('prod-banner');
  });
});
