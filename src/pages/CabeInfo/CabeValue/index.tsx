import React from 'react';
import { Button } from 'react-native-elements';
import { TextInputMask, MaskService } from 'react-native-masked-text';

import { FloatingBottomContainer } from '../components';

import { DescriptionContainer, DescriptionText, Input } from './styles';

type Props = {
  value: number;
  setValue: (value: number) => void;
  nextStep: () => void;
  backStep: () => void;
};

export default function CabeValue({
  value,
  setValue,
  nextStep,
  backStep,
}: Props) {
  const handleSetValue = (valueToChange?: string) => {
    let parsedValue = Number.parseFloat(valueToChange || '');

    if (!parsedValue) {
      parsedValue = 0;
    }

    setValue(parsedValue);
  };

  return (
    <>
      <DescriptionContainer>
        <DescriptionText style={{ textAlign: 'center', fontWeight: 'bold' }}>
          Quanto você pode gastar nesse Cabe?
        </DescriptionText>

        <DescriptionText>
          Esse é o valor alvo, que você não poderá ultrapassar enquanto estiver
          fazendo o Cabe.
        </DescriptionText>
      </DescriptionContainer>

      <TextInputMask
        type="money"
        autoCorrect={false}
        autoCapitalize="sentences"
        autoFocus
        keyboardType="decimal-pad"
        customTextInput={Input}
        customTextInputProps={{
          label: 'Valor',
          placeholder: '00.00',
        }}
        includeRawValueInChangeText
        value={MaskService.toMask('money', value.toFixed(2))}
        onChangeText={(v, rawValue) => handleSetValue(rawValue)}
      />

      <FloatingBottomContainer>
        <>
          {!!value && (
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
