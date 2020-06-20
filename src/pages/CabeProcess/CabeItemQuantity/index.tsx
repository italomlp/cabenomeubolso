import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';

import { Button } from '@app/components';

import { ScrollView } from 'react-native-gesture-handler';
import { DescriptionContainer, DescriptionText, Input } from './styles';

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
        <ScrollView keyboardShouldPersistTaps="always">
          <View style={{ flex: 1 }}>
            <DescriptionContainer>
              <DescriptionText>
                Caso a quantidade do item{' '}
                <Text style={{ fontWeight: 'bold' }}>{itemName}</Text> seja
                diferente do que você informou inicialmente, coloque o novo
                valor aqui
              </DescriptionText>
            </DescriptionContainer>
            <Input
              autoFocus
              value={quantity ? quantity.toString() : undefined}
              label="Quantidade"
              placeholder="0"
              keyboardType="numeric"
              onChangeText={value => {
                const qtt = Number.parseInt(value, 10);
                if (!Number.isNaN(qtt)) {
                  setQuantity(qtt);
                } else {
                  setQuantity(0);
                }
              }}
            />
          </View>
          <View style={{ marginVertical: 30, marginHorizontal: 10 }}>
            <Button
              containerStyle={{ marginBottom: 10 }}
              title="Voltar"
              type="outline"
              onPress={previousStep}
            />
            <Button
              gradient="quaternary"
              title="Avançar"
              disabled={!quantity}
              onPress={() => nextStep(quantity)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
