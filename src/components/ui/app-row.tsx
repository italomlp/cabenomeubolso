import type { ComponentPropsWithoutRef } from 'react';

import { Row } from './expo-ui';

type ExpoRowProps = ComponentPropsWithoutRef<typeof Row>;

export type AppRowProps = ExpoRowProps;

export function AppRow(props: AppRowProps) {
  return <Row {...props} />;
}
