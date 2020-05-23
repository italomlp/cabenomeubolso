import React, { useState } from 'react';
import { Input, ListItem, Icon } from 'react-native-elements';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';

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

type Props = {
  items: CabeItem[];
  addItem: (_: CabeItem) => void;
  editItem: (index: number, item: CabeItem) => void;
  removeItem: (index: number) => void;
  nextStep: () => void;
};

export default function CabeItemsList({
  addItem,
  items,
  editItem,
  removeItem,
  nextStep,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentItem, setCurrentItem] = useState<Partial<CabeItem>>({
    name: undefined,
    quantity: undefined,
    id: Date.now(),
  });
  const [isEditing, setIsEditing] = useState(false);
  let inputRef: Input;

  const handleAddItem = () => {
    const item = currentItem as CabeItem;
    addItem(item);
    setCurrentItem({
      name: undefined,
      quantity: undefined,
      id: Date.now() + Math.random(),
    });
    setCurrentStep(0);
  };

  const handleEditItem = () => {
    const item = currentItem as CabeItem;
    const i = items.findIndex(e => e.id === item.id);
    if (i >= 0) {
      editItem(i, item);
      setCurrentItem({
        name: undefined,
        quantity: undefined,
        id: Date.now(),
      });
      setCurrentStep(0);
      setIsEditing(false);
    }
  };

  const handleSaveItem = () => {
    if (isEditing) {
      handleEditItem();
    } else {
      handleAddItem();
    }
  };

  const handleRemoveItem = (item: CabeItem) => {
    const i = items.findIndex(e => e.id === item.id);
    if (i >= 0) {
      removeItem(i);
    }
  };

  const getInputValue = () => {
    if (currentStep === 0) {
      return currentItem.name;
    }
    if (currentItem.quantity) {
      return currentItem.quantity.toString();
    }
    return '';
  };

  const populateItemToEdit = (item: CabeItem) => {
    if (item && inputRef) {
      setCurrentItem(item);
      setCurrentStep(0);
      if (!inputRef.isFocused()) {
        inputRef.focus();
      }
      setIsEditing(true);
    }
  };

  const getAddButtonDisable = () => {
    if (currentStep === 0) {
      return !currentItem.name;
    }

    return !currentItem.quantity;
  };

  return (
    <>
      <SwipeListView
        contentContainerStyle={{ paddingBottom: 110 }}
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
        renderItem={({ item }: any) => (
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
        )}
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
                inputRef = r;
              }
            }}
            autoCorrect={false}
            autoCapitalize="sentences"
            keyboardType={currentStep === 0 ? 'default' : 'number-pad'}
            autoFocus
            value={getInputValue()}
            onChangeText={value => {
              let newCurrentItem;
              if (currentStep === 0)
                newCurrentItem = { ...currentItem, name: value };
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
            }}
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
                backgroundColor: getAddButtonDisable()
                  ? 'transparent'
                  : colors.c200,
                justifyContent: 'center',
                alignItems: 'center',
              },
              disabled: getAddButtonDisable(),
              disabledStyle: {
                backgroundColor: 'transparent',
                opacity: 0.2,
              },
              iconStyle: {
                color: getAddButtonDisable() ? undefined : colors.n100,
              },
            }}
          />
        </>
      </FloatingBottomContainer>
    </>
  );
}
