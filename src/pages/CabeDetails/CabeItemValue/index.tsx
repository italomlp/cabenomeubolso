import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Text,
  ScrollView,
} from 'react-native';
import { TextInputMask, MaskService } from 'react-native-masked-text';

import { Button } from 'components';

import {
  DescriptionContainer,
  DescriptionText,
  Input,
  QuantityText,
  TotalValue,
} from './styles';

type Props = {
  quantity: number;
  itemName: string;
  initialValue?: number;
  nextStep: (value: number) => void;
  previousStep: () => void;
};

export default function CabeItemValue({
  nextStep,
  previousStep,
  quantity,
  itemName,
  initialValue,
}: Props) {
  const [value, setValue] = useState({
    toShow: initialValue
      ? MaskService.toMask('money', initialValue.toFixed(2))
      : '0',
    toUse: initialValue || 0,
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      contentContainerStyle={{
        flex: 1,
      }}
      style={{
        flex: 1,
        flexDirection: 'column',
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <ScrollView keyboardShouldPersistTaps="always">
          <View style={{ flex: 1 }}>
            <DescriptionContainer>
              <DescriptionText>
                Informe o valor unitário do item{' '}
                <Text style={{ fontWeight: 'bold' }}>{itemName}</Text>, que nós
                vamos calcular o total para você!
              </DescriptionText>
            </DescriptionContainer>
            <TextInputMask
              type="money"
              autoFocus
              keyboardType="numeric"
              customTextInput={Input}
              customTextInputProps={{
                label: 'Valor unitário',
                placeholder: '00.00',
              }}
              includeRawValueInChangeText
              value={value.toShow}
              onChangeText={newV => {
                const newValue =
                  Number.parseFloat(
                    MaskService.toRawValue('money', newV)
                  ).toFixed(2) || '0';
                const v = Number.parseFloat(newValue || '');

                if (!Number.isNaN(v)) {
                  const realValue = MaskService.toMask('money', newValue);

                  setValue({
                    toShow: realValue,
                    toUse: Number.parseFloat(
                      MaskService.toRawValue('money', realValue) // we need to make this transform again to ensure that we have correct float precision
                    ),
                  });
                } else {
                  setValue({
                    toShow: '0',
                    toUse: 0,
                  });
                }
              }}
            />
            <QuantityText>Quantidade: {quantity}</QuantityText>
            <TotalValue>
              Total baseado no valor que você digitou:{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {MaskService.toMask(
                  'money',
                  (value.toUse * quantity).toFixed(2)
                )}
              </Text>
            </TotalValue>
          </View>
          <View style={{ marginBottom: 30, marginHorizontal: 10 }}>
            <Button
              containerStyle={{ marginBottom: 10 }}
              title="Voltar"
              type="outline"
              onPress={previousStep}
            />
            <Button
              gradient="quaternary"
              title="Concluir item"
              disabled={!value.toUse}
              onPress={() => nextStep(value.toUse)}
            />
          </View>
        </ScrollView>
        {/* <NumericKeyboard
          value={
            Number.parseFloat(
              MaskService.toRawValue('money', value.toShow)
            ).toFixed(2) || undefined
          }
          onChangeText={newValue => {
            const v = Number.parseFloat(newValue || '');

            if (!Number.isNaN(v)) {
              const realValue = MaskService.toMask('money', newValue);

              setValue({
                toShow: realValue,
                toUse: Number.parseFloat(
                  MaskService.toRawValue('money', realValue) // we need to make this transform again to ensure that we have correct float precision
                ),
              });
            } else {
              setValue({
                toShow: '0',
                toUse: 0,
              });
            }
          }}
        /> */}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
