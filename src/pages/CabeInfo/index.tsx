import React, { useState, useEffect } from 'react';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  createCabeRequest,
  getCabeRequest,
  updateCabeRequest,
} from 'store/modules/cabes/actions';
import { RootStore } from 'store/modules/rootReducer';
import { CabeItem } from 'models/CabeItem';
import { Header } from 'components';

import CabeItemsList from './CabeItemsList';
import CabeName from './CabeName';
import CabeValue from './CabeValue';

// import { Container } from './styles';

export default function CabeInfo() {
  const { goBack } = useNavigation();
  const cabeId = useNavigationParam('cabeId');
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState<CabeItem[]>([]);
  const dispatch = useDispatch();
  const cabe = useSelector((state: RootStore) => state.cabes.current);

  const isEditing = () => cabeId && cabe && cabe.id === cabeId;

  useEffect(() => {
    if (cabeId) {
      dispatch(getCabeRequest(cabeId));
    }
  }, []);

  useEffect(() => {
    if (isEditing() && cabe) {
      setName(cabe.name);
      setValue(cabe.value);
      setItems(cabe.items);
    }
  }, [cabe]);

  const addItem = (item: CabeItem) => {
    setItems([...items, item]);
  };

  const editItem = (i: number, item: CabeItem) => {
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
    if (isEditing()) {
      dispatch(updateCabeRequest({ name, value, items, id: cabeId }));
    } else {
      dispatch(
        createCabeRequest({
          name,
          value,
          items,
          id: Date.now() + Math.random(),
        })
      );
    }
  };

  const cancel = () => {
    let shouldShowAlert = false;
    if (isEditing() && cabe) {
      if (name !== cabe.name || cabe.items !== items || cabe.value !== value) {
        shouldShowAlert = true;
      }
    } else {
      shouldShowAlert = true;
    }

    if (shouldShowAlert) {
      Alert.alert(
        'Cancelar Cabe?',
        `Deseja cancelar a ${isEditing() ? 'edição' : 'criação'} do seu Cabe?`,
        [{ text: 'Não' }, { text: 'Sim', onPress: goBack }]
      );
    } else {
      goBack();
    }
  };

  return (
    <>
      <Header
        leftIcon={{ name: 'arrow-back', onPress: cancel }}
        title={isEditing() ? `${cabe?.name}` : 'Novo Cabe'}
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
