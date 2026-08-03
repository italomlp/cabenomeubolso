import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { describe, expect, it, jest } from '@jest/globals';

import { i18n } from '@/lib/localization/i18n';
import * as mockExpoUi from '@/components/ui/expo-ui.mock';

import HomeScreen from '@/app/index';

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);

describe('HomeScreen', () => {
  it('renders initialized i18n copy', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<HomeScreen />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Expo foundation ready');
    expect(texts).toContain('Semantic tokens, adapters, and theme resolution are wired up.');
    expect(texts).toContain('Router, SQLite, and preferences are initialized.');
    expect(texts).toContain('Open sheet');
  });

  it('renders the home placeholder copy', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('pt-BR');
      tree = renderer.create(<HomeScreen />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Base do Expo pronta');
    expect(texts).toContain('Tokens semânticos, adapters e resolução de tema já estão conectados.');
    expect(texts).toContain('Router, SQLite e preferências estão inicializados.');
    expect(texts).toContain('Abrir painel');
  });
});
