import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import colors from 'styles/colors';

export const SlideContainer = styled(LinearGradient)`
  flex: 1;
`;

export const SlideContent = styled.SafeAreaView`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

export const SlideTitle = styled.Text`
  font-size: 22px;
  color: ${colors.n100};
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
`;

export const SlideSubtitle = styled.Text`
  font-size: 18px;
  color: ${colors.n100};
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
  opacity: 0.9;
`;

export const SlideDescription = styled.Text`
  font-size: 16px;
  color: ${colors.n100};
  font-weight: 400;
  text-align: center;
  opacity: 0.9;
`;
