import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { AdSlot } from './ad-slot';

describe('AdSlot', () => {
  it('renders nothing when ads are not eligible', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AdSlot
          eligibility={{
            canRender: false,
            consentInfo: null,
            privacyOptionsRequired: false,
            releaseEnabled: false,
            reason: 'disabled-by-flag',
            shouldUseTestAds: false,
          }}
        >
          <Text>Ad</Text>
        </AdSlot>
      );
    });

    expect(tree!.toJSON()).toBeNull();
  });

  it('renders the provided content when eligible', () => {
    let tree: renderer.ReactTestRenderer;

    act(() => {
      tree = renderer.create(
        <AdSlot
          eligibility={{
            canRender: true,
            consentInfo: null,
            privacyOptionsRequired: false,
            releaseEnabled: true,
            reason: 'ready',
            shouldUseTestAds: true,
          }}
        >
          <Text>Ad</Text>
        </AdSlot>
      );
    });

    expect(tree!.toJSON()).not.toBeNull();
  });
});
