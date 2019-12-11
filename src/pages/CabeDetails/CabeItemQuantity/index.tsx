import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Input, Text, Button } from 'react-native-elements';

import { NumericKeyboard } from 'components';

// import { Container } from './styles';

type Props = {
  initialQuantity: number;
  itemName: string;
  nextStep: (quantity: number) => void;
  previousStep: () => void;
};

export default function CabeItemQuantity({
  nextStep,
  previousStep,
  initialQuantity,
  itemName,
}: Props) {
  const [quantity, setQuantity] = useState(initialQuantity);

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
            Caso a quantidade do item {itemName} seja diferente do que você
            informou inicialmente, coloque o novo valor aqui
          </Text>
          <Input
            editable={false}
            value={quantity ? quantity.toString() : undefined}
            label="Quantidade"
            placeholder="0"
          />
        </View>
        <View style={{ marginBottom: 30, marginHorizontal: 10 }}>
          <Button
            style={{ marginBottom: 10 }}
            title="Voltar"
            type="outline"
            onPress={previousStep}
          />
          <Button
            title="Avançar"
            disabled={!quantity}
            onPress={() => nextStep(quantity)}
          />
        </View>
        <NumericKeyboard
          value={quantity ? quantity.toString() : undefined}
          onChangeText={value => {
            const qtt = Number.parseInt(value, 10);
            if (!Number.isNaN(qtt)) {
              setQuantity(qtt);
            } else {
              setQuantity(0);
            }
          }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
