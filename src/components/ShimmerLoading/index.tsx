import React from 'react';
import Shimmer from 'react-native-shimmer';

import { Container, Title } from './styles';

const ShimmerLoading: React.FC = () => {
  return (
    <Container>
      <Shimmer>
        <Title>Cabe no Meu Bolso</Title>
      </Shimmer>
    </Container>
  );
};

export default ShimmerLoading;
