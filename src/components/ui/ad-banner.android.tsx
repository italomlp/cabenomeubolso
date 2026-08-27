import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/design-system/theme-context';

import type { AdaptiveBannerPlacement } from './ad-banner';

export function AdBanner({ placement }: { placement: AdaptiveBannerPlacement }) {
  const theme = useAppTheme();
  // Both approved placements are rendered inside AppScreen's ScrollView.
  // Inline adaptive banners are the correct format for scrolling content.
  const size = BannerAdSize.INLINE_ADAPTIVE_BANNER;

  return (
    <View
      accessibilityLabel="Advertisement"
      style={[styles.container, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}
      testID={`ad-banner-${placement}`}
    >
      <BannerAd requestOptions={{}} size={size} unitId={TestIds.BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', borderRadius: 12, borderWidth: 1, overflow: 'hidden', paddingVertical: 4 },
});
