import React from 'react';

import { Button } from 'components';

import { FloatingBottomContainer } from '../components';

import { DescriptionContainer, DescriptionText, Input } from './styles';

type Props = {
  name: string;
  setName: (value: string) => void;
  nextStep: () => void;
  backStep: () => void;
};

export default function CabeName({ name, setName, nextStep, backStep }: Props) {
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
