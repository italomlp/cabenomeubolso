import React, { useState } from 'react';
import { Input, ListItem, Button, Icon } from 'react-native-elements';
import {
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from 'react-native';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';

// import { Container } from './styles';

type Item = {
  name: string | undefined;
  quantity: number | undefined;
  id?: number;
};

type Props = {
  items: Item[];
  addItem: (_: Item) => void;
  editItem: (index: number, item: Item) => void;
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
  const [currentItem, setCurrentItem] = useState<Item>({
    name: undefined,
    quantity: undefined,
    id: Date.now(),
  });
  const [isEditing, setIsEditing] = useState(false);
  let inputRef: Input;

  const handleAddItem = () => {
    const item = currentItem;
    addItem(item);
    setCurrentItem({
      name: undefined,
      quantity: undefined,
      id: Date.now(),
    });
    setCurrentStep(0);
  };

  const handleEditItem = () => {
    const item = currentItem;
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

  const handleRemoveItem = (item: Item) => {
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
    return undefined;
  };

  const populateItemToEdit = (item: Item) => {
    if (item && inputRef) {
      setCurrentItem(item);
      setCurrentStep(0);
      if (!inputRef.isFocused()) {
        inputRef.focus();
      }
      setIsEditing(true);
    }
  };

  return (
    <>
      <Text>
        Adicione itens ao seu Cabe digitando abaixo. Remova arrastando o item
        para o lado esquerdo. Edite clicando sobre cada item. Ao finalizar a
        lista, clique em Avançar.
      </Text>
      {!items.length ? (
        <Text>Não há itens ainda</Text>
      ) : (
        <SwipeListView
          data={items}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }: any) => (
            <SwipeRow
              rightOpenValue={-75}
              leftOpenValue={75}
              stopLeftSwipe={100}
              stopRightSwipe={-100}
            >
              <View
                style={{
                  height: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: 'flex-start',
                    backgroundColor: 'green',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: 75,
                      backgroundColor: 'green',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      name="edit"
                      color="#fff"
                      onPress={() => populateItemToEdit(item)}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'flex-end',
                    backgroundColor: 'red',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: 75,
                      backgroundColor: 'red',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      name="delete"
                      color="#fff"
                      onPress={() => handleRemoveItem(item)}
                    />
                  </View>
                </View>
              </View>
              <ListItem
                title={`${item.quantity}x ${item.name}`}
                bottomDivider
              />
            </SwipeRow>
          )}
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          position: 'absolute',
          width: '100%',
          bottom: 0,
        }}
        contentContainerStyle={{ flex: 1 }}
      >
        <SafeAreaView>
          {!!items.length && (
            <Button
              onPress={() => nextStep()}
              title="Avançar"
              type="outline"
              style={{ marginBottom: 10, paddingHorizontal: 20 }}
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
              const newCurrentItem =
                currentStep === 0
                  ? { ...currentItem, name: value }
                  : {
                      ...currentItem,
                      quantity: Number.parseInt(value, 10),
                    };
              setCurrentItem(newCurrentItem);
            }}
            placeholder={currentStep === 0 ? 'Nome do item' : 'Quantidade'}
            leftIcon={{
              name: 'arrow-back',
              onPress: () => {
                setCurrentStep(0);
              },
            }}
            leftIconContainerStyle={{
              display: currentStep === 0 ? 'none' : 'flex',
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
              disabled:
                currentStep === 0 ? !currentItem.name : !currentItem.quantity,
            }}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}
