import Color from 'color';
import styled from 'styled-components/native';

import colors from '@app/styles/colors';

export const DescriptionContainer = styled.View`
  margin: 15px;
  padding-bottom: 15px;
  border-bottom-color: ${Color(colors.c200).lighten(0.3).hex()};
  border-bottom-width: 1px;
`;

export const DescriptionLine = styled.Text`
  color: ${Color(colors.n100).darken(0.7).hex()};
  font-size: 16px;
  margin-bottom: 5px;
`;

export const EmptyList = styled.Text`
  text-align: center;
  margin-top: 15px;
  font-size: 18px;
`;

export const SwipeableContainer = styled.View`
  height: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const LeftSwipeableItem = styled.View`
  flex: 1;
  align-items: flex-start;
  background-color: green;
`;

export const SwipeableItemContent = styled.View`
  height: 100%;
  width: 75;
  /* backgroundColor: 'green', */
  align-items: center;
  justify-content: center;
`;

export const RightSwipeableItem = styled.View`
  flex: 1;
  align-items: flex-end;
  background-color: red;
`;
