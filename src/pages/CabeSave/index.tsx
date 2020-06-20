import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { useStackNavigation, useTypedRoute } from 'hooks/useTypedNavigaiton';
import {
  createCabeRequest,
  getCabeRequest,
  updateCabeRequest,
} from 'store/modules/cabes/actions';
import { RootStore } from 'store/modules/rootReducer';
import { Header, ShimmerLoading } from 'components';

import CabeItemsList from './CabeItemsList';
import CabeName from './CabeName';
import CabeValue from './CabeValue';
import { CabeSaveProvider, useCabeSave } from './CabeSaveContext';

// import { Container } from './styles';

function CabeSave() {
  const { goBack } = useStackNavigation();
  const { params } = useTypedRoute<'CabeSave'>();
  const cabeId = params ? params.cabeId : null;
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const {
    cabeValue: { items, name, value },
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
      setLoading(true);
      dispatch(getCabeRequest(cabeId));
    } else {
      setTimeout(() => setLoading(false), 400);
    }
  }, []);

  useEffect(() => {
    if (isEditing && cabe) {
      setName(cabe.name);
      setValue(cabe.value);
      setItems(cabe.items);
      setTimeout(() => setLoading(false), 400);
    }
  }, [isEditing, cabe]);

  const saveCabe = useCallback(() => {
    if (isEditing && cabeId) {
      dispatch(updateCabeRequest({ name, value, items, id: cabeId }));
    } else {
      dispatch(
        createCabeRequest({
          name,
          value,
          items,
          id: uuidv4(),
        }),
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
        [{ text: 'Não' }, { text: 'Sim', onPress: goBack }],
      );
    } else {
      goBack();
    }
    return true;
  }, [isEditing, cabe, name, value, items, goBack]);

  if (loading) {
    return <ShimmerLoading />;
  }

  return (
    <>
      <Header
        leftIcon={{ name: 'arrow-back', onPress: cancel }}
        title={isEditing ? `${cabe?.name}` : 'Novo Cabe'}
      />
      {/* <AndroidBackHandler onBackPress={() => cancel()} /> */}
      {currentStep === 0 && (
        <CabeItemsList nextStep={() => setCurrentStep(1)} />
      )}
      {currentStep === 1 && (
        <CabeValue
          nextStep={() => setCurrentStep(2)}
          backStep={() => setCurrentStep(0)}
        />
      )}
      {currentStep === 2 && (
        <CabeName nextStep={saveCabe} backStep={() => setCurrentStep(1)} />
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
