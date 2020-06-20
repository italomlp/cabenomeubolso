import React from 'react';

import { Button } from '@app/components';

import { useCabeSave } from '../CabeSaveContext';
import { FloatingBottomContainer } from '../components';
import { DescriptionContainer, DescriptionText, Input } from './styles';

type Props = {
  nextStep: () => void;
  backStep: () => void;
};

export default function CabeName({ nextStep, backStep }: Props) {
  const {
    cabeValue: { name },
    setName,
  } = useCabeSave();
  return (
    <>
      <DescriptionContainer>
        <DescriptionText>Dê um nome a esse Cabe</DescriptionText>
      </DescriptionContainer>

      <Input
        autoCorrect={false}
        autoCapitalize="sentences"
        autoFocus
        label="Nome"
        value={name}
        onChangeText={setName}
        placeholder="Meu Cabe Maravilhoso"
      />

      <FloatingBottomContainer>
        <>
          {!!name && (
            <Button
              gradient="tertiary"
              onPress={nextStep}
              title="Concluir"
              type="solid"
              containerStyle={{ padding: 10, paddingBottom: 5 }}
            />
          )}
          <Button
            onPress={backStep}
            title="Voltar"
            type="outline"
            containerStyle={{ padding: 10, paddingTop: 5 }}
          />
        </>
      </FloatingBottomContainer>
    </>
  );
}
