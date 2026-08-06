import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import type { ComponentProps } from 'react';
import { describe, expect, it, jest } from '@jest/globals';

import { i18n } from '@/lib/localization/i18n';
import * as mockExpoUi from '@/components/ui/expo-ui.mock';

import HomeScreen from '@/app/index';

type HomeScreenDependencies = NonNullable<NonNullable<ComponentProps<typeof HomeScreen>>['dependencies']>;

jest.mock('@/components/ui/expo-ui', () => mockExpoUi);
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), removeItem: jest.fn(), setItem: jest.fn() },
}));
jest.mock('expo-localization', () => ({
  getLocales: () => [{ currencyCode: 'BRL', languageTag: 'pt-BR', regionCode: 'BR' }],
}));

function createRuntime(): HomeScreenDependencies {
  return {
    repository: {
      get: jest.fn(async () => null),
      list: jest.fn(async () => []),
      save: jest.fn(async () => undefined),
    },
    useCases: {
      finalizeList: jest.fn(async () => {
        throw new Error('not expected');
      }),
      loadList: jest.fn(async () => null),
      reopenList: jest.fn(async () => {
        throw new Error('not expected');
      }),
      saveList: jest.fn(async () => undefined),
    },
  } as const;
}

describe('HomeScreen', () => {
  it('renders the localized home and create-list shell copy', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      await i18n.changeLanguage('en');
      tree = renderer.create(<HomeScreen dependencies={createRuntime()} />);
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
      tree = renderer.create(<HomeScreen dependencies={createRuntime()} />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Início');
    expect(texts).toContain('Planeje a próxima lista offline antes de comprar.');
    expect(texts).toContain('Resumos ativos');
    expect(texts).toContain('Resumos finalizados');
    expect(texts).toContain('Criar lista');
  });
});
