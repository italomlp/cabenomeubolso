import React from 'react';
import { Header, ListItem, Button, Text, Icon } from 'react-native-elements';

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
  return (
    <>
      <Header
        centerComponent={{
          text: 'Meus Cabes',
          h4: true,
          style: { color: '#fff' },
        }}
      />
      <FloatingButtonContainer>
        <Button title="Adicionar" type="solid" icon={{ name: 'add-circle' }} />
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
