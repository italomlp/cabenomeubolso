import React, { useState } from 'react';
import { Header, Input, ListItem, Button, Icon } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';
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

export default function CabeInfo() {
  const { goBack } = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentItem, setCurrentItem] = useState<Item>({
    name: undefined,
    quantity: undefined,
    id: Date.now(),
  });
  const [items, setItems] = useState<Item[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  let inputRef: Input;

  const addItem = () => {
    const item = currentItem;
    setItems([...items, item]);
    setCurrentItem({ name: undefined, quantity: undefined, id: Date.now() });
    setCurrentStep(0);
  };

  const saveEditItem = () => {
    const item = currentItem;
    const i = items.findIndex(e => e.id === item.id);
    if (i >= 0) {
      const itemsCopy = [...items];
      itemsCopy[i] = item;
      setItems(itemsCopy);
      setCurrentItem({ name: undefined, quantity: undefined });
      setCurrentStep(0);
      setIsEditing(false);
    }
  };

  const handleSaveItem = () => {
    if (isEditing) {
      saveEditItem();
    } else {
      addItem();
    }
  };

  const removeItem = (item: Item) => {
    const i = items.findIndex(e => e.id === item.id);
    console.tron.log(
      `trying to remove item ${item.name} with qtt ${item.quantity} and id ${item.id}. Index was: ${i}`
    );
    if (i >= 0) {
      const itemsCopy = [...items];
      itemsCopy.splice(i, 1);
      console.tron.log('new items are', itemsCopy);
      setItems(itemsCopy);
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

  const editItem = (item: Item) => {
    console.tron.log('editar');
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
      <Header
        leftComponent={{ icon: 'arrow-back', onPress: () => goBack() }}
        centerComponent={{ text: 'Novo Cabe' }}
      />
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
                      onPress={() => editItem(item)}
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
                      onPress={() => removeItem(item)}
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
        style={{ position: 'absolute', width: '100%', bottom: 0 }}
        contentContainerStyle={{ flex: 1 }}
      >
        <SafeAreaView>
          {!!items.length && (
            <Button
              onPress={() => console.tron.log('next page')}
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
                  : { ...currentItem, quantity: Number.parseInt(value, 10) };
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
