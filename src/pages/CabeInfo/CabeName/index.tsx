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
  name: string;
  setName: (value: string) => void;
  nextStep: () => void;
  backStep: () => void;
};

export default function CabeName({ name, setName, nextStep, backStep }: Props) {
  return (
    <>
      <Text>Dê um nome a esse Cabe</Text>

      <Input
        autoCorrect={false}
        autoCapitalize="sentences"
        autoFocus
        value={name}
        onChangeText={setName}
        placeholder="Meu Cabe Maravilhoso"
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
