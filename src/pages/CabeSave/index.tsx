import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AndroidBackHandler } from 'react-navigation-backhandler';

import {
  createCabeRequest,
  getCabeRequest,
  updateCabeRequest,
} from 'store/modules/cabes/actions';
import { RootStore } from 'store/modules/rootReducer';
import { Header } from 'components';

import CabeItemsList from './CabeItemsList';
import CabeName from './CabeName';
import CabeValue from './CabeValue';
import { CabeSaveProvider, useCabeSave } from './CabeSaveContext';

// import { Container } from './styles';

function CabeSave() {
  const { goBack } = useNavigation();
  const cabeId = useNavigationParam('cabeId');
  const [currentStep, setCurrentStep] = useState(0);
  const dispatch = useDispatch();
  const {
    cabeValue: { items, name, value },
    addItem,
    editItem,
    removeItem,
    setName,
    setValue,
    setItems,
  } = useCabeSave();
  const cabe = useSelector((state: RootStore) => state.cabes.current);

  const isEditing = useMemo(() => cabeId && cabe && cabe.id === cabeId, [
    cabeId,
    cabe,
  ]);

  useEffect(() => {
    if (cabeId) {
      dispatch(getCabeRequest(cabeId));
    }
  }, []);

  useEffect(() => {
    if (isEditing && cabe) {
      setName(cabe.name);
      setValue(cabe.value);
      setItems(cabe.items);
    }
  }, [isEditing, cabe]);

  const saveCabe = useCallback(() => {
    if (isEditing) {
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
  }, [dispatch, isEditing, name, value, items, cabeId]);

  const cancel = useCallback(() => {
    let shouldShowAlert = false;
    if (isEditing && cabe) {
      if (name !== cabe.name || cabe.items !== items || cabe.value !== value) {
        shouldShowAlert = true;
      }
    } else {
      shouldShowAlert = true;
    }

    if (shouldShowAlert) {
      Alert.alert(
        'Cancelar Cabe?',
        `Deseja cancelar a ${isEditing ? 'edição' : 'criação'} do seu Cabe?`,
        [{ text: 'Não' }, { text: 'Sim', onPress: goBack }]
      );
    } else {
      goBack();
    }
    return true;
  }, [isEditing, cabe, name, value, items, goBack]);

  return (
    <>
      <Header
        leftIcon={{ name: 'arrow-back', onPress: cancel }}
        title={isEditing ? `${cabe?.name}` : 'Novo Cabe'}
      />
      <AndroidBackHandler onBackPress={() => cancel()} />
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

export default () => {
  return (
    <CabeSaveProvider>
      <CabeSave />
    </CabeSaveProvider>
  );
};
