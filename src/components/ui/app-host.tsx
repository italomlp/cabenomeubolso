import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/design-system/theme-context';

import { Host } from './expo-ui';

type AppHostProps = {
  children: ReactNode;
};

export function AppHost({ children }: AppHostProps) {
  const theme = useAppTheme();

  return (
    <Host colorScheme={theme.mode} style={[styles.host, { backgroundColor: theme.colors.surface }]}>
      {children}
    </Host>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
});
