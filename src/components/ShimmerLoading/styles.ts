import styled from 'styled-components/native';

import colors from 'styles/colors';

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

export const Title = styled.Text`
  font-size: 24px;
  color: ${colors.c400};
`;
