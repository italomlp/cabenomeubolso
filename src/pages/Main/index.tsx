import React, { useEffect } from 'react';
import { ListItem, Text, Icon } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';

import { useDispatch, useSelector } from 'react-redux';
import { listCabesRequest } from 'store/modules/cabes/actions';
import { RootStore } from 'store/modules/rootReducer';

import { Header, Button } from 'components';

import LinearGradient from 'react-native-linear-gradient';
import colors from 'styles/colors';
import {
  FloatingButtonContainer,
  List,
  ListItemTitleContainer,
  SubTitleContainer,
} from './styles';

export default function Main() {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();
  const [list] = useSelector((state: RootStore) => [state.cabes.list]);

  const getCabes = () => {
    dispatch(listCabesRequest());
  };

  useEffect(() => {
    getCabes();
  }, []);

  return (
    <>
      <Header title="Meus Cabes" />
      <FloatingButtonContainer>
        <Button
          buttonStyle={{ marginHorizontal: 10 }}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: [colors.c200, colors.c300],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 0 },
          }}
          title="Adicionar"
          type="solid"
          icon={{
            name: 'add-circle',
            color: colors.n100,
          }}
          onPress={() => navigate('CabeInfo')}
        />
      </FloatingButtonContainer>
      <List
        ListEmptyComponent={
          <Text>
            Ainda não há nenhum Cabe. Adicione um clicando no botão abaixo.
          </Text>
        }
        data={list}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <ListItem
            title={
              <ListItemTitleContainer>
                <Text>{item.name}</Text>
                <Icon name="edit" />
              </ListItemTitleContainer>
            }
            onPress={() => navigate('CabeDetails', { id: item.id })}
            bottomDivider
            subtitle={
              <SubTitleContainer>
                <Text>R$ </Text>
                <Text h2>{item.value}</Text>
              </SubTitleContainer>
            }
          />
        )}
      />
    </>
  );
}
