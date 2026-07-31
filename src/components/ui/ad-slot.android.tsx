import { View } from 'react-native';

export type AdSlotProps = {
  testID?: string;
};

export function AdSlot({ testID }: AdSlotProps) {
  // Native ad placement stays isolated here until the release gate enables AdMob wiring.
  return <View accessibilityLabel="Native ad slot reserved" collapsable={false} testID={testID} />;
}
