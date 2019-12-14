import styled from 'styled-components/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import LinearGradient from 'react-native-linear-gradient';
import Color from 'color';

import colors from 'styles/colors';

export const FloatingButtonContainer = styled.SafeAreaView`
  position: absolute;
  z-index: 98;
  bottom: 0;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  padding-right: 10px;
  padding-left: 10px;
  padding-bottom: 20px;
`;

export const List = styled(SwipeListView).attrs(() => ({
  contentContainerStyle: { padding: 10, paddingBottom: 80 },
}))``;

export const ListItemTitleContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const SubTitleContainer = styled.Text`
  text-align: right;
`;

export const SwipeableContainer = styled.View`
  height: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const SwipeableItemContent = styled.TouchableOpacity`
  height: 100%;
  width: 75;
  align-items: center;
  justify-content: center;
`;

export const RightSwipeableItem = styled(LinearGradient).attrs({
  colors: [
    colors.c500,
    Color(colors.c500)
      .darken(0.2)
      .hex(),
    colors.c300,
  ],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
  locations: [0.1, 0.7, 1],
})`
  flex: 1;
  height: 100%;
  justify-content: flex-end;
  flex-direction: row;
`;
