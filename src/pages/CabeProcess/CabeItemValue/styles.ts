import { Input as DefaultInput } from 'react-native-elements';

import Color from 'color';
import styled from 'styled-components/native';

import colors from '@app/styles/colors';

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

export const QuantityText = styled.Text`
  margin-top: 5px;
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  color: ${Color(colors.n100).darken(0.8).hex()};
`;

export const TotalValue = styled.Text`
  text-align: center;
  margin-top: 15px;
  padding: 5px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${Color(colors.n100).darken(0.8).hex()};
`;
