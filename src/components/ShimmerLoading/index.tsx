import React from 'react';
import Shimmer from 'react-native-shimmer';

import { Container, Title, Description, TextContainer } from './styles';

const ShimmerLoading: React.FC = () => {
  return (
    <Container>
      <Shimmer duration={100}>
        <TextContainer>
          <Title>Cabe no Meu Bolso</Title>
          <Description>Carregando...</Description>
        </TextContainer>
      </Shimmer>
    </Container>
  );
};

export default ShimmerLoading;
