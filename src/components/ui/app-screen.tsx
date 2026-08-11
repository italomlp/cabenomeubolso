import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/design-system/theme-context';

import { AppHost } from './app-host';
import { ScrollView } from './expo-ui';

type AppScreenProps = {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;
  testID?: string;
};

export function AppScreen({ children, contentStyle, scrollEnabled = true, testID }: AppScreenProps) {
  const theme = useAppTheme();
  const scrollViewStyle = StyleSheet.flatten([
    styles.content,
    { backgroundColor: theme.colors.surface, paddingHorizontal: theme.space.content, paddingVertical: theme.space.content },
    contentStyle,
  ]) as Parameters<typeof ScrollView>[0]['style'];

  return (
    <AppHost>
      <ScrollView style={scrollViewStyle} disabled={!scrollEnabled} testID={testID}>
        {children}
      </ScrollView>
    </AppHost>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
});
