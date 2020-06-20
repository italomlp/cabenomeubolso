import React from 'react';
import { TextInputMask, MaskService } from 'react-native-masked-text';

import { Button } from '@app/components';

import { FloatingBottomContainer } from '../components';

import { DescriptionContainer, DescriptionText, Input } from './styles';
import { useCabeSave } from '../CabeSaveContext';

type Props = {
  nextStep: () => void;
  backStep: () => void;
};

export default function CabeValue({ nextStep, backStep }: Props) {
  const {
    cabeValue: { value },
    setValue,
  } = useCabeSave();
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
              gradient="tertiary"
              onPress={nextStep}
              title="Avançar"
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
