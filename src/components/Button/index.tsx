import React from 'react';
import { Button as DefaultButton, ButtonProps } from 'react-native-elements';

import colors from 'styles/colors';

// import { Container } from './styles';

type Props = ButtonProps & {
  color?: keyof typeof colors;
};

export default function Button({
  color,
  buttonStyle,
  titleStyle,
  icon,
  ...props
}: Props) {
  const style = color ? { backgroundColor: colors[color] } : undefined;
  const textStyle = color
    ? {
        color: '#fff',
      }
    : undefined;
  return (
    <DefaultButton
      buttonStyle={[style, buttonStyle]}
      titleStyle={[textStyle, titleStyle]}
      icon={
        typeof icon === 'object' && color
          ? { ...icon, color, iconStyle: textStyle }
          : icon
      }
      {...props}
    />
  );
}
