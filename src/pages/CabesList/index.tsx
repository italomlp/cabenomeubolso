import React, { useEffect, useState } from 'react';
import { ListItem, Text, Icon } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { MaskService } from 'react-native-masked-text';
import { SwipeRow } from 'react-native-swipe-list-view';
import { Alert } from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';

import { useStackNavigation } from 'hooks/useTypedNavigaiton';
import {
  listCabesRequest,
  removeCabeRequest,
} from 'store/modules/cabes/actions';
import { RootStore } from 'store/modules/rootReducer';
import { Header, Button } from 'components';
import colors from 'styles/colors';
import { Cabe } from 'models/Cabe';

import {
  FloatingButtonContainer,
  List,
  ListItemTitleContainer,
  SubTitleContainer,
  RightSwipeableItem,
  SwipeableContainer,
  SwipeableItemContent,
  EmptyListText,
  FinalizedHeader,
  FinalizedHeaderText,
  FinalizedContent,
  FinalizedContentItem,
  FinalizedContentItemText,
} from './styles';

export default function CabesList() {
  const { navigate } = useStackNavigation();
  const dispatch = useDispatch();
  const [list] = useSelector((state: RootStore) => [state.cabes.list]);
  const [showFinalized, setShowFinalized] = useState(false);

  const getCabes = () => {
    dispatch(listCabesRequest());
  };

  const removeCabe = (cabe: Cabe) => {
    Alert.alert('Remover Cabe?', `Deseja remover o Cabe ${cabe.name}?`, [
      { text: 'Não' },
      { text: 'Sim', onPress: () => dispatch(removeCabeRequest(cabe.id)) },
    ]);
  };

  const getFinalized = () => list.filter(c => c.finalized === true);

  useEffect(() => {
    getCabes();
  }, []);

  return (
    <>
      <Header title="Meus Cabes" />
      <FloatingButtonContainer>
        <Button
          iconButton
          gradient="primary"
          type="solid"
          icon={{
            name: 'add',
            color: colors.n100,
          }}
          onPress={() => navigate('CabeSave', {})}
        />
      </FloatingButtonContainer>
      <List
        ListEmptyComponent={
          <EmptyListText>
            Ainda não há nenhum Cabe. Adicione um clicando no botão abaixo.
          </EmptyListText>
        }
        ListFooterComponent={
          getFinalized().length ? (
            <Accordion
              activeSections={showFinalized ? [0] : []}
              onChange={() => setShowFinalized(!showFinalized)}
              renderHeader={section => (
                <FinalizedHeader show={showFinalized}>
                  <FinalizedHeaderText show={showFinalized}>
                    {section.title}
                  </FinalizedHeaderText>
                </FinalizedHeader>
              )}
              sections={[
                {
                  title: 'Finalizados',
                  content: {
                    items: getFinalized(),
                  },
                },
              ]}
              renderContent={section => (
                <FinalizedContent>
                  {section.content.items.map((cabe, index) => (
                    <FinalizedContentItem
                      key={cabe.id}
                      onPress={() =>
                        navigate('FinalizedCabeView', { cabeId: cabe.id })
                      }
                      last={index === section.content.items.length - 1}
                    >
                      <FinalizedContentItemText>
                        {cabe.name}
                      </FinalizedContentItemText>
                      <FinalizedContentItemText>
                        {MaskService.toMask('money', cabe.value.toFixed(2))}
                      </FinalizedContentItemText>
                    </FinalizedContentItem>
                  ))}
                </FinalizedContent>
              )}
            />
          ) : null
        }
        data={list.filter(c => c.finalized === false)}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <SwipeRow
            rightOpenValue={-150}
            stopRightSwipe={-250}
            disableRightSwipe
          >
            <SwipeableContainer>
              <RightSwipeableItem>
                <SwipeableItemContent
                  onPress={() => navigate('CabeSave', { cabeId: item.id })}
                >
                  <Icon name="edit" color="#fff" />
                </SwipeableItemContent>
                <SwipeableItemContent onPress={() => removeCabe(item)}>
                  <Icon name="delete" color="#fff" />
                </SwipeableItemContent>
              </RightSwipeableItem>
            </SwipeableContainer>
            <ListItem
              title={
                <ListItemTitleContainer>
                  <Text>{item.name}</Text>
                </ListItemTitleContainer>
              }
              onPress={() => navigate('CabeProcess', { id: item.id })}
              bottomDivider
              subtitle={
                <SubTitleContainer>
                  <Text h2>{MaskService.toMask('money', item.value)}</Text>
                </SubTitleContainer>
              }
            />
          </SwipeRow>
        )}
      />
    </>
  );
}
