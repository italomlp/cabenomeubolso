import styled from 'styled-components/native';
import Color from 'color';
import colors from '@app/styles/colors';
import { DefaultTheme } from 'styled-components';
import { ListItem as DefaultListItem } from 'react-native-elements';

export const ListHeaderContainer = styled.View`
  margin-bottom: 10px;
`;

export const FinalizedAtText = styled.Text`
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: ${Color(colors.n100).darken(0.8).hex()};
`;

export const ValuesContainer = styled.View`
  padding: 15px 0;
  margin: 0 15px;
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: ${Color(colors.c200).lighten(0.3).hex()};
`;

export const ValueItemContainer = styled.View`
  flex: 1;
  align-items: center;
`;

export const ValueItemTitle = styled.Text`
  font-size: 12px;
  color: ${Color(colors.n100).darken(0.5).hex()};
`;

export const ValueItemText = styled.Text<
  DefaultTheme & {
    healthy: boolean;
  }
>`
  font-size: 28px;
  color: ${props =>
    props.healthy ? Color(colors.c500).darken(0.4).hex() : colors.c300};
`;

export const ValueRestText = styled.Text`
  margin-top: 5px;
  text-align: center;
  font-size: 12px;
  font-weight: 400;
  color: ${Color(colors.n100).darken(0.8).hex()};
`;

export const SectionHeader = styled.Text`
  font-size: 14px;
  color: ${colors.c100};
  font-weight: bold;
  text-transform: uppercase;
  padding-left: 15px;
  margin-top: 20px;
`;

export const ItemRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const ItemText = styled.Text`
  font-size: 18px;
`;

export const ListItem = styled(DefaultListItem)<
  DefaultTheme & {
    done?: boolean;
  }
>`
  opacity: ${props => (props.done ? 1 : 0.4)};
`;
