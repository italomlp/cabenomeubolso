import React, { useState } from 'react';
import { Header } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';

import { CabeItem } from 'models/CabeItem';

import CabeItems from './CabeItems';
import CabeItemQuantity from './CabeItemQuantity';
import CabeItemValue from './CabeItemValue';

// import { Container } from './styles';

export default function CabeDetails() {
  const { goBack } = useNavigation();
  const [step, setStep] = useState(0);
  const [currentItem, setCurrentItem] = useState<CabeItem | null>(null);
  const [itemsDone, setItemsDone] = useState<CabeItem[]>([]);

  const addItem = (item: CabeItem) => {
    setItemsDone([...itemsDone, item]);
  };

  const editItem = (item: CabeItem, index: number) => {
    const itemsCopy = [...itemsDone];
    itemsCopy[index] = item;
    setItemsDone(itemsCopy);
  };

  const saveItem = () => {
    if (!currentItem) {
      return;
    }

    const index = itemsDone.findIndex(i => i.id === currentItem.id);
    if (index >= 0) {
      editItem(currentItem, index);
    } else {
      addItem(currentItem);
    }
  };

  return (
    <>
      <Header
        leftComponent={
          step === 0
            ? { icon: 'arrow-back', onPress: () => goBack() }
            : undefined
        }
        centerComponent={{ text: 'Titulo do Cabe' }}
      />
      {step === 0 && (
        <CabeItems
          onClickItem={(item: CabeItem) => {
            setCurrentItem(item);
            setStep(1);
          }}
        />
      )}
      {step === 1 && (
        <CabeItemQuantity
          itemName={currentItem ? currentItem.name : ''}
          initialQuantity={currentItem ? currentItem.quantity : 0}
          nextStep={(quantity: number) => {
            setStep(2);
            if (currentItem && quantity !== currentItem.quantity) {
              setCurrentItem({ ...currentItem, quantity });
            }
          }}
          previousStep={() => {
            setStep(0);
          }}
        />
      )}
      {step === 2 && (
        <CabeItemValue
          itemName={currentItem ? currentItem.name : ''}
          quantity={currentItem ? currentItem.quantity : 0}
          nextStep={value => {
            if (currentItem && value !== currentItem.value) {
              setCurrentItem({ ...currentItem, value });
              saveItem();
              setStep(0);
            }
          }}
          previousStep={() => {
            setStep(1);
          }}
        />
      )}
    </>
  );
}
