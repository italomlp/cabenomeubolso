import React from 'react';
import { Button } from 'react-native-elements';
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
              onPress={nextStep}
              title="Avançar"
              type="solid"
              style={{ marginBottom: 10 }}
            />
          )}
          <Button
            onPress={backStep}
            title="Voltar"
            type="outline"
            style={{ marginBottom: 10 }}
          />
        </>
      </FloatingBottomContainer>
    </>
  );
}
