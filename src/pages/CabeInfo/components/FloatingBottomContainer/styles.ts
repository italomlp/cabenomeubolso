import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView.attrs({
  contentContainerStyle: { flex: 1 },
})`
  position: absolute;
  width: 100%;
  padding: 10px;
  bottom: 0;
`;
