import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView.attrs({
  contentContainerStyle: { flex: 1 },
})`
  position: absolute;
  width: 100%;
  padding-bottom: 10px;
  bottom: 0;
  background-color: #fff;
`;
