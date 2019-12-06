import React, { useState } from 'react';
import { Header } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';
import { Alert } from 'react-native';

import CabeItemsList from './CabeItemsList';
import CabeName from './CabeName';
import CabeValue from './CabeValue';

// import { Container } from './styles';

type Item = {
  name: string | undefined;
  quantity: number | undefined;
  id?: number;
};

export default function CabeInfo() {
  const { goBack } = useNavigation();
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState<Item[]>([]);

  const addItem = (item: Item) => {
    setItems([...items, item]);
  };

  const editItem = (i: number, item: Item) => {
    if (i >= 0) {
      const itemsCopy = [...items];
      itemsCopy[i] = item;
      setItems(itemsCopy);
    }
  };

  const removeItem = (i: number) => {
    if (i >= 0) {
      const itemsCopy = [...items];
      itemsCopy.splice(i, 1);
      setItems(itemsCopy);
    }
  };

  const saveCabe = () => {
    console.tron.log('save', { name, value, items });
  };

  const cancel = () => {
    Alert.alert('Cancelar Cabe?', 'Deseja cancelar a criação do seu Cabe?', [
      { text: 'Não' },
      { text: 'Sim', onPress: goBack },
    ]);
  };

  return (
    <>
      <Header
        leftComponent={{ icon: 'arrow-back', onPress: cancel }}
        centerComponent={{ text: 'Novo Cabe' }}
      />
      {currentStep === 0 && (
        <CabeItemsList
          addItem={addItem}
          editItem={editItem}
          items={items}
          removeItem={removeItem}
          nextStep={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 1 && (
        <CabeValue
          value={value}
          setValue={setValue}
          nextStep={() => setCurrentStep(2)}
          backStep={() => setCurrentStep(0)}
        />
      )}
      {currentStep === 2 && (
        <CabeName
          name={name}
          setName={setName}
          nextStep={saveCabe}
          backStep={() => setCurrentStep(1)}
        />
      )}
    </>
  );
}
