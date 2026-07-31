import type { ReactNode } from 'react';
import { useAppTheme } from '@/design-system/theme-context';

import { BottomSheet, Column, Text } from './expo-ui';

type AppSheetProps = {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  visible: boolean;
};

export function AppSheet({ children, onClose, title, visible }: AppSheetProps) {
  const theme = useAppTheme();

  if (!visible) {
    return null;
  }

  return (
    <BottomSheet isPresented={visible} onDismiss={onClose} testID="app-sheet">
      <Column
        spacing={theme.space.md}
        style={{
          ...styles.sheet,
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          padding: theme.space.lg,
        }}
      >
        {title ? (
          <Text
            textStyle={{
              color: theme.colors.onSurface,
              fontSize: theme.typography.title.fontSize,
              fontWeight: theme.typography.title.fontWeight,
              lineHeight: theme.typography.title.lineHeight,
            }}
          >
            {title}
          </Text>
        ) : null}
        {children}
      </Column>
    </BottomSheet>
  );
}

const styles = {
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
  },
} as const;
