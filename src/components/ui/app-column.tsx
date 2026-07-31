import type { ComponentPropsWithoutRef } from 'react';

import { Column } from './expo-ui';

type ExpoColumnProps = ComponentPropsWithoutRef<typeof Column>;

export type AppColumnProps = ExpoColumnProps;

export function AppColumn(props: AppColumnProps) {
  return <Column {...props} />;
}
