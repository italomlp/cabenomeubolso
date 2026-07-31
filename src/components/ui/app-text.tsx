import type { ComponentPropsWithoutRef } from 'react';

import { Text } from './expo-ui';

type ExpoTextProps = ComponentPropsWithoutRef<typeof Text>;

export type AppTextProps = ExpoTextProps;

export function AppText(props: AppTextProps) {
  return <Text {...props} />;
}
