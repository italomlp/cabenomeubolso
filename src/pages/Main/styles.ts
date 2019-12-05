import styled from 'styled-components/native';
import { FlatList } from 'react-native';

export const FloatingButtonContainer = styled.SafeAreaView`
  position: absolute;
  z-index: 98;
  bottom: 0;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
`;

export const List = styled(FlatList).attrs(() => ({
  contentContainerStyle: { padding: 10, paddingBottom: 100 },
}))``;

export const ListItemTitleContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const SubTitleContainer = styled.Text`
  text-align: right;
`;
