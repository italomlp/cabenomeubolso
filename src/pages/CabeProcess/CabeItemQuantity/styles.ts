import styled from 'styled-components/native';
import Color from 'color';
import { Input as DefaultInput } from 'react-native-elements';

import colors from 'styles/colors';

export const DescriptionContainer = styled.View`
  margin: 15px;
  padding-bottom: 15px;
  border-bottom-width: 1px;
  border-bottom-color: ${Color(colors.c200).lighten(0.3).hex()};
`;

export const DescriptionText = styled.Text`
  color: ${Color(colors.n100).darken(0.7).hex()};
  font-size: 16px;
  margin-bottom: 5px;
`;

export const Input = styled(DefaultInput).attrs({
  inputStyle: {
    textAlign: 'right',
  },
})``;
