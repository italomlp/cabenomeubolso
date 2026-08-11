import renderer, { act } from 'react-test-renderer';
import type { ReactNode } from 'react';
import { describe, expect, it, beforeEach, jest } from '@jest/globals';

import CreateListRoute from '@/app/list/new';
import ListDetailRoute from '@/app/list/[id]';
import ListStackLayout from '@/app/list/_layout';

const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockSearchParams = { id: 'list-1' };
const stackScreenProps: { name: string; options?: { title?: string } }[] = [];
let createListScreenProps: { onClose?: () => void } | null = null;
let listDetailScreenProps: { onClose?: () => void } | null = null;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockSearchParams,
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
  }),
}));

jest.mock('expo-router/stack', () => {
  function Stack({ children }: { children?: ReactNode }) {
    return <>{children}</>;
  }

  (Stack as unknown as { displayName: string }).displayName = 'Stack';

  function StackScreen({ children, ...props }: { children?: ReactNode; name: string; options?: { title?: string } }) {
    stackScreenProps.push({ name: props.name, options: props.options });
    return <>{children}</>;
  }

  (StackScreen as unknown as { displayName: string }).displayName = 'Stack.Screen';
  Stack.Screen = StackScreen;

  return { Stack };
});

jest.mock('@/components/planning/create-list-screen', () => ({
  __esModule: true,
  default: (props: { onClose?: () => void }) => {
    createListScreenProps = props;
    return null;
  },
}));

jest.mock('@/components/planning/list-detail-screen', () => ({
  __esModule: true,
  default: (props: { onClose?: () => void }) => {
    listDetailScreenProps = props;
    return null;
  },
}));

describe('list route presentation', () => {
  beforeEach(() => {
    mockBack.mockReset();
    mockReplace.mockReset();
    mockSearchParams = { id: 'list-1' };
    stackScreenProps.length = 0;
    createListScreenProps = null;
    listDetailScreenProps = null;
  });

  it('uses stack presentation with localized titles', () => {
    act(() => {
      renderer.create(<ListStackLayout />);
    });

    expect(stackScreenProps).toEqual([
      { name: 'new', options: { title: 'Create list' } },
      { name: '[id]', options: { title: 'List details' } },
    ]);
  });

  it('backs out of the list screens instead of replacing to home', () => {
    act(() => {
      renderer.create(<CreateListRoute />);
      renderer.create(<ListDetailRoute />);
    });

    createListScreenProps?.onClose?.();
    listDetailScreenProps?.onClose?.();

    expect(mockBack).toHaveBeenCalledTimes(2);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
