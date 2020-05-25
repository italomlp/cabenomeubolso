import React, { memo } from 'react';
import { Button as DefaultButton, ButtonProps } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

import colors from 'styles/colors';

const gradients = {
  primary: {
    colors: [colors.c200, colors.c300],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  secondary: {
    colors: [colors.c100, colors.c500],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  tertiary: {
    colors: [colors.c300, colors.c400],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  quaternary: {
    colors: [colors.c200, colors.c100],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};

type Props = ButtonProps & {
  color?: keyof typeof colors;
  iconButton?: boolean;
  iconButtonSize?: number;
  gradient?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
};

function Button({
  color,
  iconButton,
  buttonStyle,
  titleStyle,
  icon,
  iconButtonSize,
  gradient,
  disabledStyle,
  disabledTitleStyle,
  ...props
}: Props) {
  const style = color ? { backgroundColor: colors[color] } : undefined;
  const textStyle = color
    ? {
        color: '#fff',
      }
    : undefined;

  const getGradientProps = () => gradient && gradients[gradient];

  return (
    <DefaultButton
      ViewComponent={gradient && LinearGradient}
      linearGradientProps={getGradientProps()}
      buttonStyle={[
        style,
        buttonStyle,
        iconButton && {
          width: iconButtonSize || 50,
          height: iconButtonSize || 50,
          borderRadius: iconButtonSize ? iconButtonSize / 2 : 25,
        },
      ]}
      titleStyle={[textStyle, titleStyle]}
      icon={
        typeof icon === 'object' && color
          ? { ...icon, color, iconStyle: textStyle }
          : icon
      }
      disabledStyle={
        gradient ? [{ opacity: 0.4 }, disabledStyle] : disabledStyle
      }
      disabledTitleStyle={
        gradient
          ? [{ color: colors.n900, opacity: 0.4 }, disabledTitleStyle]
          : disabledTitleStyle
      }
      {...props}
    />
  );
}

export default memo(Button);
