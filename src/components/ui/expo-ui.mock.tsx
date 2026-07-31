import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from 'react';
import {
  Pressable as RNPressable,
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

type TextInputProps = ComponentPropsWithoutRef<typeof RNTextInput> & {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

function withGap(style: StyleProp<ViewStyle> | undefined, spacing: number | undefined) {
  return [style, spacing != null ? { gap: spacing } : null];
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
  return <RNTextInput {...props} style={[style, textStyle]} />;
}
