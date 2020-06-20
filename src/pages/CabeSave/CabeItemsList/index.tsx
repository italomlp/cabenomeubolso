import React, { useState, useCallback, memo } from 'react';
import { ListItem, Icon } from 'react-native-elements';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import { v4 as uuidv4 } from 'uuid';

import { CabeItem } from '@app/models/CabeItem';
import { Button, CabeItemInput } from '@app/components';

import { FloatingBottomContainer } from '../components';

import {
  DescriptionContainer,
  DescriptionLine,
  EmptyList,
  SwipeableContainer,
  LeftSwipeableItem,
  RightSwipeableItem,
  SwipeableItemContent,
} from './styles';
import { useCabeSave } from '../CabeSaveContext';

type Props = {
  nextStep: () => void;
};

function CabeItemsList({ nextStep }: Props) {
  const [editingValue, setEditingValue] = useState<CabeItem | null>(null);
  const {
    addItem,
    editItem,
    removeItem,
    cabeValue: { items },
  } = useCabeSave();

  const handleAddItem = useCallback(
    (name, quantity) => {
      addItem({ name, quantity, done: false, value: 0, id: uuidv4() });
    },
    [addItem],
  );

  const handleEditItem = useCallback(
    (name, quantity) => {
      if (editingValue) {
        const i = items.findIndex(e => e.id === editingValue.id);
        if (i >= 0) {
          editItem(i, { ...editingValue, name, quantity });
          setEditingValue(null);
        }
      }
    },
    [editingValue, items, editItem],
  );

  const handleSaveItem = useCallback(
    (name, quantity) => {
      if (editingValue) {
        handleEditItem(name, quantity);
      } else {
        handleAddItem(name, quantity);
      }
    },
    [editingValue, handleEditItem, handleAddItem],
  );

  const handleRemoveItem = useCallback(
    (item: CabeItem) => {
      const i = items.findIndex(e => e.id === item.id);
      if (i >= 0) {
        removeItem(i);
      }
    },
    [items, removeItem],
  );

  const renderItem = useCallback(
    ({ item }: any) => (
      <SwipeRow
        rightOpenValue={-75}
        leftOpenValue={75}
        stopLeftSwipe={100}
        stopRightSwipe={-100}
      >
        <SwipeableContainer>
          <LeftSwipeableItem>
            <SwipeableItemContent>
              <Icon
                name="edit"
                color="#fff"
                onPress={() => setEditingValue(item)}
              />
            </SwipeableItemContent>
          </LeftSwipeableItem>
          <RightSwipeableItem>
            <SwipeableItemContent>
              <Icon
                name="delete"
                color="#fff"
                onPress={() => handleRemoveItem(item)}
              />
            </SwipeableItemContent>
          </RightSwipeableItem>
        </SwipeableContainer>
        <ListItem title={`${item.quantity}x ${item.name}`} bottomDivider />
      </SwipeRow>
    ),
    [handleRemoveItem],
  );

  return (
    <>
      <SwipeListView
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={<EmptyList>Ainda não há itens</EmptyList>}
        ListHeaderComponent={
          <DescriptionContainer>
            <DescriptionLine>
              - Adicione itens ao seu Cabe digitando abaixo.
            </DescriptionLine>
            <DescriptionLine>
              - Remova arrastando o item para o lado esquerdo.
            </DescriptionLine>
            <DescriptionLine>
              - Edite arrastando o item para o lado direito.
            </DescriptionLine>
            <DescriptionLine>
              - Ao finalizar a lista, clique em Avançar.
            </DescriptionLine>
          </DescriptionContainer>
        }
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <FloatingBottomContainer>
        <>
          {!!items.length && (
            <Button
              gradient="tertiary"
              containerStyle={{ padding: 10 }}
              onPress={() => nextStep()}
              title="Avançar"
            />
          )}
          <CabeItemInput
            onClickSave={({ name, quantity }) => handleSaveItem(name, quantity)}
            customValue={editingValue}
          />
        </>
      </FloatingBottomContainer>
    </>
  );
}

export default memo(CabeItemsList);
