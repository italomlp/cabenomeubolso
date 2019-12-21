import React from 'react';
import {
  HeaderProps,
  Header as DefaultHeader,
  Icon,
} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Platform } from 'react-native';

import colors from 'styles/colors';

import { HeaderTitleContainer } from './styles';

type IconProp = { name: string; onPress?: (_?: any) => any };

type Props = HeaderProps & {
  title?: string;
  leftIcon?: IconProp;
  rightIcon?: IconProp;
};

export default function Header({
  title,
  leftIcon,
  rightIcon,
  ...props
}: Props) {
  return (
    <DefaultHeader
      {...props}
      ViewComponent={LinearGradient}
      statusBarProps={{
        backgroundColor: 'transparent',
        barStyle: 'light-content',
        translucent: true,
      }}
      containerStyle={Platform.select({
        android: Platform.Version <= 20 ? { paddingTop: 0, height: 56 } : {},
      })}
      linearGradientProps={{
        colors: [colors.c400, colors.c500],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
      }}
      leftComponent={
        leftIcon && (
          <TouchableOpacity
            onPress={leftIcon.onPress}
            disabled={!leftIcon.onPress}
          >
            <Icon name={leftIcon.name} color={colors.n100} />
          </TouchableOpacity>
        )
      }
      rightComponent={
        rightIcon && (
          <TouchableOpacity
            onPress={rightIcon.onPress}
            disabled={!rightIcon.onPress}
          >
            <Icon name={rightIcon.name} color={colors.n100} />
          </TouchableOpacity>
        )
      }
      centerComponent={<HeaderTitleContainer>{title}</HeaderTitleContainer>}
    />
  );
}
