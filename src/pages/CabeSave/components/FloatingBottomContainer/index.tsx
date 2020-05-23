import React from 'react';
import { Platform, SafeAreaView } from 'react-native';

import { Container } from './styles';

type Props = {
  children: React.ReactChild | React.ReactChildren | React.ReactElement;
};

export default function FloatingBottomContainer({ children }: Props) {
  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView>{children}</SafeAreaView>
    </Container>
  );
}
