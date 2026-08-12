import type { ReactNode } from 'react';
import { Platform } from 'react-native';

import { useAppTheme } from '@/design-system/theme-context';

import { AppButton } from './app-button';
import { AppSheet } from './app-sheet';
import { AppColumn } from './app-column';
import { AppRow } from './app-row';
import { ScrollView } from './expo-ui';

type AppFormSheetProps = {
  children: ReactNode;
  cancelLabel: string;
  cancelTestID?: string;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveHint?: string;
  saveLabel: string;
  saveTestID?: string;
  title: string;
  visible: boolean;
};

export function AppFormSheet({
  children,
  cancelLabel,
  cancelTestID,
  onCancel,
  onSave,
  saveDisabled = false,
  saveHint,
  saveLabel,
  saveTestID,
  title,
  visible,
}: AppFormSheetProps) {
  const theme = useAppTheme();
  const scrollViewProps = Platform.OS === 'ios' ? ({ keyboardDismissMode: 'interactive' } as any) : undefined;

  if (!visible) {
    return null;
  }

  return (
    <AppSheet onClose={onCancel} title={title} visible>
      <AppColumn spacing={theme.space.md}>
        <ScrollView {...scrollViewProps}>
          <AppColumn spacing={theme.space.md} style={{ paddingBottom: theme.space.sm }}>
            {children}
          </AppColumn>
        </ScrollView>
        <AppRow spacing={theme.space.sm}>
          <AppButton label={cancelLabel} onPress={onCancel} testID={cancelTestID} variant="ghost" />
          <AppButton accessibilityHint={saveHint} disabled={saveDisabled} label={saveLabel} onPress={onSave} testID={saveTestID} />
        </AppRow>
      </AppColumn>
    </AppSheet>
  );
}
