import React, { useState, useRef, useCallback, memo, useMemo } from 'react';
import { Input, ListItem, Icon } from 'react-native-elements';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import { v4 as uuidv4 } from 'uuid';

import { CabeItem } from 'models/CabeItem';
import { Button } from 'components';
import colors from 'styles/colors';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [currentItem, setCurrentItem] = useState<Partial<CabeItem>>({
    name: undefined,
    quantity: undefined,
    id: uuidv4(),
  });
  const [isEditing, setIsEditing] = useState(false);
  const {
    addItem,
    editItem,
    removeItem,
    cabeValue: { items },
  } = useCabeSave();
  const inputRef = useRef<Input>();

  const handleAddItem = useCallback(() => {
    const item = currentItem as CabeItem;
    addItem(item);
    setCurrentItem({
      name: undefined,
      quantity: undefined,
      id: uuidv4(),
    });
    setCurrentStep(0);
  }, [currentItem]);

  const handleEditItem = useCallback(() => {
    const item = currentItem as CabeItem;
    const i = items.findIndex(e => e.id === item.id);
    if (i >= 0) {
      editItem(i, item);
      setCurrentItem({
        name: undefined,
        quantity: undefined,
        id: uuidv4(),
      });
      setCurrentStep(0);
      setIsEditing(false);
    }
  }, [currentItem, items, editItem]);

  const handleSaveItem = useCallback(() => {
    if (isEditing) {
      handleEditItem();
    } else {
      handleAddItem();
    }
  }, [isEditing, handleEditItem, handleAddItem]);

  const handleRemoveItem = useCallback(
    (item: CabeItem) => {
      const i = items.findIndex(e => e.id === item.id);
      if (i >= 0) {
        removeItem(i);
      }
    },
    [items, removeItem]
  );

  const inputValue = useMemo(() => {
    if (currentStep === 0) {
      return currentItem.name;
    }
    if (currentItem.quantity) {
      return currentItem.quantity.toString();
    }
    return '';
  }, [currentStep, currentItem]);

  const populateItemToEdit = useCallback(
    (item: CabeItem) => {
      if (item && inputRef.current) {
        setCurrentItem(item);
        setCurrentStep(0);
        if (!inputRef.current.isFocused()) {
          inputRef.current.focus();
        }
        setIsEditing(true);
      }
    },
    [inputRef.current]
  );

  const addButtonDisabled = useMemo(() => {
    console.tron.log('addButtonDisabled', currentItem);
    if (currentStep === 0) {
      return !currentItem.name;
    }

    return !currentItem.quantity;
  }, [currentStep, currentItem]);

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
                onPress={() => populateItemToEdit(item)}
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
    [populateItemToEdit, handleRemoveItem]
  );

  const handleChangeText = useCallback(
    value => {
      let newCurrentItem;
      if (currentStep === 0) newCurrentItem = { ...currentItem, name: value };
      else {
        if (value && !Number.parseInt(value, 10)) {
          return;
        }
        newCurrentItem = {
          ...currentItem,
          quantity: Number.parseInt(value, 10),
        };
      }
      setCurrentItem(newCurrentItem);
    },
    [currentStep, currentItem]
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
          <Input
            ref={r => {
              if (r) {
                inputRef.current = r;
              }
            }}
            autoCorrect={false}
            autoCapitalize="sentences"
            keyboardType={currentStep === 0 ? 'default' : 'number-pad'}
            autoFocus
            value={inputValue}
            onChangeText={handleChangeText}
            placeholder={currentStep === 0 ? 'Nome do item' : 'Quantidade'}
            leftIcon={{
              name: 'arrow-back',
              onPress: () => {
                setCurrentStep(0);
              },
              containerStyle: {
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: colors.c400,
                justifyContent: 'center',
                alignItems: 'center',
              },
              iconStyle: {
                color: colors.n100,
              },
            }}
            leftIconContainerStyle={{
              display: currentStep === 0 ? 'none' : 'flex',
              marginLeft: 0,
              paddingLeft: 0,
              marginRight: 10,
            }}
            rightIcon={{
              name: currentStep === 0 ? 'add' : 'check',
              onPress: () => {
                if (currentStep === 0) {
                  setCurrentStep(1);
                } else {
                  handleSaveItem();
                }
              },
              containerStyle: {
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: addButtonDisabled
                  ? 'transparent'
                  : colors.c200,
                justifyContent: 'center',
                alignItems: 'center',
              },
              disabled: addButtonDisabled,
              disabledStyle: {
                backgroundColor: 'transparent',
                opacity: 0.2,
              },
              iconStyle: {
                color: addButtonDisabled ? undefined : colors.n100,
              },
            }}
          />
        </>
      </FloatingBottomContainer>
    </>
  );
}

export default memo(CabeItemsList);
