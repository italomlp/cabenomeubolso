import React from 'react';
import { Icon } from 'react-native-elements';

import colors from '@app/styles/colors';

import { Container, Row, Key, KeyText, LinearGradient } from './styles';

type Props = {
  value?: string;
  onChangeText: (value: string) => any;
};

export default function NumericKeyboard({ value, onChangeText }: Props) {
  const onKeyClick = (key?: string) => {
    if (value) {
      const newValue = key ? `${value}${key}` : value.slice(0, -1);
      onChangeText(newValue);
    } else if (key) {
      onChangeText(key);
    }
  };

  return (
    <Container>
      <Row>
        <Key onPress={() => onKeyClick('7')}>
          <LinearGradient>
            <KeyText>7</KeyText>
          </LinearGradient>
        </Key>
        <Key onPress={() => onKeyClick('8')}>
          <LinearGradient>
            <KeyText>8</KeyText>
          </LinearGradient>
        </Key>
        <Key onPress={() => onKeyClick('9')}>
          <LinearGradient>
            <KeyText>9</KeyText>
          </LinearGradient>
        </Key>
      </Row>
      <Row>
        <Key onPress={() => onKeyClick('4')}>
          <LinearGradient>
            <KeyText>4</KeyText>
          </LinearGradient>
        </Key>
        <Key onPress={() => onKeyClick('5')}>
          <LinearGradient>
            <KeyText>5</KeyText>
          </LinearGradient>
        </Key>
        <Key onPress={() => onKeyClick('6')}>
          <LinearGradient>
            <KeyText>6</KeyText>
          </LinearGradient>
        </Key>
      </Row>
      <Row>
        <Key onPress={() => onKeyClick('1')}>
          <LinearGradient>
            <KeyText>1</KeyText>
          </LinearGradient>
        </Key>
        <Key onPress={() => onKeyClick('2')}>
          <LinearGradient>
            <KeyText>2</KeyText>
          </LinearGradient>
        </Key>
        <Key onPress={() => onKeyClick('3')}>
          <LinearGradient>
            <KeyText>3</KeyText>
          </LinearGradient>
        </Key>
      </Row>
      <Row>
        <Key disabled>
          <LinearGradient>
            <KeyText />
          </LinearGradient>
        </Key>
        <Key onPress={() => onKeyClick('0')}>
          <LinearGradient>
            <KeyText>0</KeyText>
          </LinearGradient>
        </Key>
        <Key onPress={() => onKeyClick()}>
          <LinearGradient>
            <Icon name="backspace" color={colors.n100} />
          </LinearGradient>
        </Key>
      </Row>
    </Container>
  );
}
