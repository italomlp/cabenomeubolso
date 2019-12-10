import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Input, Text, Button } from 'react-native-elements';
import { TextInputMask, MaskService } from 'react-native-masked-text';

// import { Container } from './styles';

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
        <View style={{ flex: 1 }}>
          <Text>
            Informe o valor unitário do item {itemName}, que nós vamos calcular
            o total para você!
          </Text>
          <TextInputMask
            keyboardType="decimal-pad"
            type="money"
            customTextInput={Input}
            customTextInputProps={{
              label: 'Valor unitário',
              placeholder: '00.00',
            }}
            includeRawValueInChangeText
            autoFocus
            value={value.toShow}
            onChangeText={(newValue, newValueRaw) => {
              const v = Number.parseFloat(newValueRaw || '');
              if (!Number.isNaN(v)) {
                setValue({
                  toShow: newValue,
                  toUse: v,
                });
              } else {
                setValue({
                  toShow: '0',
                  toUse: 0,
                });
              }
            }}
            blurOnSubmit={false}
          />
          <Text>
            Total baseado no valor que você digitou:
            {MaskService.toMask('money', (value.toUse * quantity).toFixed(2))}
          </Text>
        </View>
        <View style={{ marginBottom: 30, marginHorizontal: 10 }}>
          <Button
            style={{ marginBottom: 10 }}
            title="Voltar"
            type="outline"
            onPress={previousStep}
          />
          <Button
            title="Concluir item"
            disabled={!value.toUse}
            onPress={() => nextStep(value.toUse)}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
