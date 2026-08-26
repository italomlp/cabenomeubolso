import {
  BottomSheet,
  Button,
  Column,
  Host,
  Row,
  ScrollView as ExpoScrollView,
  Text,
  TextInput,
  useNativeState as expoUseNativeState,
} from '@expo/ui';
import { createElement, type ComponentPropsWithoutRef } from 'react';

export type ObservableState<T> = {
  get(): T;
  set(value: T): void;
  value: T;
  onChange: ((value: T) => void) | null;
};

export type ScrollViewProps = ComponentPropsWithoutRef<typeof ExpoScrollView> & {
  keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
};

export { BottomSheet, Button, Column, Host, Row, Text, TextInput };

export const ScrollView = ExpoScrollView as unknown as (props: ScrollViewProps) => ReturnType<typeof createElement>;

export function useNativeState<T>(initialValue: T): ObservableState<T> {
  return expoUseNativeState(initialValue) as ObservableState<T>;
}
