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
  colors: [colors.c500, Color(colors.c500).darken(0.2).hex(), colors.c300],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
  locations: [0.1, 0.7, 1],
})`
  flex: 1;
  height: 100%;
  justify-content: flex-end;
  flex-direction: row;
`;

export const EmptyListText = styled.Text`
  font-size: 18px;
  text-align: center;
  font-weight: 500;
  margin-top: auto;
  margin-bottom: auto;
  padding: 20px 0;
`;

export const FinalizedHeader = styled(LinearGradient).attrs({
  colors: [
    Color(colors.c300).lighten(0.5).hex(),
    Color(colors.c400).lighten(0.5).hex(),
  ],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
})<{
  show: boolean;
}>`
  margin-top: 20px;
  margin-bottom: -1px;
  padding: 5px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-left-radius: ${props => (props.show ? 0 : '5px')};
  border-bottom-right-radius: ${props => (props.show ? 0 : '5px')};
  opacity: ${props => (props.show ? 1 : 0.6)};
`;

export const FinalizedHeaderText = styled.Text<{
  show: boolean;
}>`
  text-align: center;
  color: ${colors.n100};
  font-size: 16px;
  font-weight: ${props => (props.show ? 'bold' : '500')};
`;

export const FinalizedContent = styled(LinearGradient).attrs({
  colors: [
    Color(colors.c300).lighten(0.5).hex(),
    Color(colors.c400).lighten(0.5).hex(),
  ],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
})`
  padding: 5px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
`;

export const FinalizedContentItem = styled.TouchableOpacity<{ last?: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  margin: 0 10px;
  border-style: solid;
  border-bottom-color: ${colors.n100};
  border-bottom-width: ${props => (props.last ? '0' : '1px')};
`;

export const FinalizedContentItemText = styled.Text`
  color: ${colors.n100};
  font-size: 14px;
  font-weight: 500;
`;
