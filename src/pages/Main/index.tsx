import React, { useEffect } from 'react';
import { Header, ListItem, Button, Text, Icon } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';

import { useDispatch, useSelector } from 'react-redux';
import { listCabesRequest } from 'store/modules/cabes/actions';
import { RootStore } from 'store/modules/rootReducer';
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
      <Header
        centerComponent={{
          text: 'Meus Cabes',
        }}
      />
      <FloatingButtonContainer>
        <Button
          title="Adicionar"
          type="solid"
          icon={{ name: 'add-circle' }}
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
            onPress={() => navigate('CabeDetails')}
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
