import React from 'react';
import { Header, ListItem, Button, Text, Icon } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';

import {
  FloatingButtonContainer,
  List,
  ListItemTitleContainer,
  SubTitleContainer,
} from './styles';

const CabesList = [
  {
    title: 'Feira do mês',
    value: 450,
  },
  {
    title: 'Feira do mês',
    value: 450,
  },
  {
    title: 'Feira do mês',
    value: 450,
  },
  {
    title: 'Feira do mês',
    value: 450,
  },
  {
    title: 'Feira do mês',
    value: 450,
  },
  {
    title: 'Feira do mês',
    value: 450,
  },
  {
    title: 'Feira do mês',
    value: 450,
  },
  {
    title: 'Feira do mês',
    value: 450,
  },
];

export default function Main() {
  const { navigate } = useNavigation();

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
        data={CabesList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }: any) => (
          <ListItem
            title={
              <ListItemTitleContainer>
                <Text>{item.title}</Text>
                <Icon name="edit" />
              </ListItemTitleContainer>
            }
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
