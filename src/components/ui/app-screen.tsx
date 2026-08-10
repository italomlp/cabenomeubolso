import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  return (
    <AppHost>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.surface }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView
            contentContainerStyle={[
              styles.content,
              { paddingHorizontal: theme.space.content, paddingVertical: theme.space.content },
              contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={scrollEnabled}
            testID={testID}
          >
            <View style={styles.inner}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppHost>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
});
