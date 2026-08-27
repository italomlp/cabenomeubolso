import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/design-system/theme-context';

import type { AdaptiveBannerPlacement } from './ad-banner';
import { resolveBannerAdRequestOptions, resolveBannerAdUnitId } from '@/lib/ads/ad-request-configuration';

export function AdBanner({ placement, advertisementLabel, shouldUseTestAds, productionBannerAdUnitId }: { placement: AdaptiveBannerPlacement; advertisementLabel: string; shouldUseTestAds: boolean; productionBannerAdUnitId?: string }) {
  const theme = useAppTheme();
  // Both approved placements are rendered inside AppScreen's ScrollView.
  // Inline adaptive banners are the correct format for scrolling content.
  let ads: typeof import('react-native-google-mobile-ads');
  try {
    // Expo Go does not contain the native module. Keep this require out of
    // module scope so the disabled/no-native path remains safe.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    ads = require('react-native-google-mobile-ads');
  } catch {
    return null;
  }
  const unitId = resolveBannerAdUnitId({ productionBannerAdUnitId, shouldUseTestAds });
  if (!unitId) return null;

  return (
    <View
      accessible
      accessibilityLabel={advertisementLabel}
      accessibilityRole="image"
      style={[styles.container, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}
      testID={`ad-banner-${placement}`}
    >
      <ads.BannerAd requestOptions={resolveBannerAdRequestOptions()} size={ads.BannerAdSize.INLINE_ADAPTIVE_BANNER} unitId={unitId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', borderRadius: 12, borderWidth: 1, overflow: 'hidden', paddingVertical: 4 },
});
