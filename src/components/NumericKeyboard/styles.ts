import DefaultLinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';

import Color from 'color';

import colors from 'styles/colors';

export const Container = styled.View`
  background-color: ${Color(colors.c200)
    .lighten(0.4)
    .hex()};
`;

export const Row = styled.View`
  flex-direction: row;
  margin-bottom: 1px;
  margin-top: 1px;

  &:last-child {
    margin-bottom: 0;
  }
  &:first-child {
    margin-top: 0;
  }
`;

export const Key = styled.TouchableOpacity.attrs({
  activeOpacity: 0.7,
})`
  flex: 1;
  height: 70px;
  margin-right: 1px;
  margin-left: 1px;

  &:last-child {
    margin-right: 0;
  }
  &:first-child {
    margin-left: 0;
  }
`;

export const LinearGradient = styled(DefaultLinearGradient).attrs({
  colors: [colors.c300, colors.c200],
  start: { x: -0.5, y: 0 },
  end: { x: 1, y: 1 },
})`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const KeyText = styled.Text`
  color: ${colors.n100};
  font-weight: bold;
  font-size: 20px;
`;
