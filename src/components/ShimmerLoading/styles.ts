import styled from 'styled-components/native';

import colors from '@app/styles/colors';

export const Container = styled.View`
  flex: 1;
  background-color: #fff;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
`;

export const TextContainer = styled.View`
  justify-content: center;
  align-items: center;
`;

export const Title = styled.Text`
  font-size: 24px;
  color: ${colors.c400};
  text-align: center;
`;

export const Description = styled.Text`
  font-size: 14px;
  color: ${colors.n900};
  text-align: center;
  padding-top: 30px;
`;
