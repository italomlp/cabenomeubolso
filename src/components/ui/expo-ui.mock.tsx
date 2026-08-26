import { useMemo, useReducer, useRef, type ComponentPropsWithoutRef, type PropsWithChildren, type ReactNode } from 'react';
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

type BoxProps = {
  children?: ReactNode;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
};

type TextProps = {
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
};

type ButtonProps = PropsWithChildren<{
  label?: string;
  variant?: string;
} & ComponentPropsWithoutRef<typeof RNPressable>>;

type HostProps = PropsWithChildren<{
  colorScheme?: string;
  style?: StyleProp<ViewStyle>;
} & ComponentPropsWithoutRef<typeof RNView>>;

type ScrollViewProps = PropsWithChildren<ComponentPropsWithoutRef<typeof RNScrollView>>;

type TextInputProps = ComponentPropsWithoutRef<typeof RNTextInput> & {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

type NativeStateValue<T> = {
  get: () => T;
  set: (value: T) => void;
  value: T;
  onChange: ((value: T) => void) | null;
};

function withGap(style: StyleProp<ViewStyle> | undefined, spacing: number | undefined) {
  return [style, spacing != null ? { gap: spacing } : null];
}

function isNativeStateValue<T>(value: unknown): value is NativeStateValue<T> {
  return typeof value === 'object' && value !== null && 'get' in value && 'set' in value;
}

function resolveTextInputValue<T>(value: T | NativeStateValue<T> | undefined) {
  if (isNativeStateValue<T>(value)) {
    return value.get();
  }

  return value;
}

export function BottomSheet({ children, ...props }: PropsWithChildren<ComponentPropsWithoutRef<typeof RNView>>) {
  return <RNView {...props}>{children}</RNView>;
}

export function Button({ children, label, variant: _variant, ...props }: ButtonProps) {
  return <RNPressable {...props}>{children ?? <RNText>{label}</RNText>}</RNPressable>;
}

export function Column({ children, spacing, style, ...props }: BoxProps & ComponentPropsWithoutRef<typeof RNView>) {
  return (
    <RNView {...props} style={withGap(style, spacing)}>
      {children}
    </RNView>
  );
}

export function Host({ children, colorScheme: _colorScheme, style, ...props }: HostProps) {
  return (
    <RNView {...props} style={style}>
      {children}
    </RNView>
  );
}

export function ScrollView({ children, ...props }: ScrollViewProps) {
  return <RNScrollView {...props}>{children}</RNScrollView>;
}

export function Row({ children, spacing, style, ...props }: BoxProps & ComponentPropsWithoutRef<typeof RNView>) {
  return (
    <RNView {...props} style={withGap(style, spacing)}>
      {children}
    </RNView>
  );
}

export function Text({ children, textStyle, style, ...props }: TextProps & ComponentPropsWithoutRef<typeof RNText>) {
  return (
    <RNText {...props} style={[style, textStyle]}>
      {children}
    </RNText>
  );
}

export function TextInput({ style, textStyle, ...props }: TextInputProps) {
  return <RNTextInput {...props} style={[style, textStyle]} value={resolveTextInputValue(props.value)} />;
}

export function useNativeState<T>(initialValue: T): NativeStateValue<T> {
  const valueRef = useRef(initialValue);
  const onChangeRef = useRef<NativeStateValue<T>['onChange']>(null);
  const [, forceRender] = useReducer((count: number) => count + 1, 0);

  return useMemo<NativeStateValue<T>>(
    () => ({
      get: () => valueRef.current,
      set: (value: T) => {
        if (Object.is(valueRef.current, value)) {
          return;
        }

        valueRef.current = value;
        onChangeRef.current?.(value);
        forceRender();
      },
      get value() {
        return valueRef.current;
      },
      set value(value: T) {
        if (Object.is(valueRef.current, value)) {
          return;
        }

        valueRef.current = value;
        onChangeRef.current?.(value);
        forceRender();
      },
      get onChange() {
        return onChangeRef.current;
      },
      set onChange(listener) {
        onChangeRef.current = listener;
      },
    }),
    [forceRender]
  );
}
