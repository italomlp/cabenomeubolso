import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { i18n } from '@/lib/localization/i18n';
import * as mockExpoUi from '@/components/ui/expo-ui.mock';

import HomeScreen from '@/app/index';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

describe('HomeScreen', () => {
  it('renders the localized home and create-list shell copy', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<HomeScreen />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Home');
    expect(texts).toContain('Plan the next list offline before you shop.');
    expect(texts).toContain('Active summaries');
    expect(texts).toContain('Finalized summaries');
    expect(texts).toContain('Create list');
  });

  it('renders the pt-BR shell copy', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('pt-BR');
      tree = renderer.create(<HomeScreen />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Início');
    expect(texts).toContain('Planeje a próxima lista offline antes de comprar.');
    expect(texts).toContain('Resumos ativos');
    expect(texts).toContain('Resumos finalizados');
    expect(texts).toContain('Criar lista');
  });
});
