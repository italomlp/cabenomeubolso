import React from 'react';
import { Input, Button } from 'react-native-elements';
import {
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// import { Container } from './styles';

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
  const handleSetValue = (valueToChange: string) => {
    if (!valueToChange) return;

    const parsedValue = Number.parseFloat(valueToChange);

    if (!parsedValue) return;

    setValue(parsedValue);
  };

  return (
    <>
      <Text>Quanto você pode gastar nesse Cabe?</Text>

      <Text>Descrição do valor</Text>

      <Input
        autoCorrect={false}
        autoCapitalize="sentences"
        keyboardType="decimal-pad"
        autoFocus
        value={value ? value.toString() : undefined}
        onChangeText={handleSetValue}
        placeholder="00,00"
        leftIcon={<Text>R$</Text>}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ position: 'absolute', width: '100%', bottom: 0 }}
        contentContainerStyle={{ flex: 1 }}
      >
        <SafeAreaView>
          <Button
            onPress={nextStep}
            title="Avançar"
            type="solid"
            style={{ marginBottom: 10, paddingHorizontal: 20 }}
          />
          <Button
            onPress={backStep}
            title="Voltar"
            type="outline"
            style={{ marginBottom: 10, paddingHorizontal: 20 }}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}
