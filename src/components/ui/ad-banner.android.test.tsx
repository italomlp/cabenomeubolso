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

import { AdBanner } from './ad-banner.android';

describe('Android AdBanner', () => {
  it('uses inline adaptive format for the Home banner in scrolling content', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(<AdBanner placement="home-list-content" />);
    });

    expect(tree!.root.findAll((node) => String(node.type) === 'mock-banner-ad')[0]?.props.size).toBe('inline-adaptive');
  });
});
