import {
  BottomSheet,
  Button,
  Column,
  Host,
  Row,
  ScrollView,
  Text,
  TextInput,
  useNativeState as expoUseNativeState,
} from '@expo/ui';

export type ObservableState<T> = {
  get(): T;
  set(value: T): void;
  value: T;
  onChange: ((value: T) => void) | null;
};

export { BottomSheet, Button, Column, Host, Row, ScrollView, Text, TextInput };

export function useNativeState<T>(initialValue: T): ObservableState<T> {
  return expoUseNativeState(initialValue) as ObservableState<T>;
}
