import { Text } from 'react-native';
import renderer from 'react-test-renderer';
import { act } from 'react-test-renderer';
import { describe, expect, it } from '@jest/globals';

import HomeScreen from './index';

describe('HomeScreen', () => {
  it('renders the home placeholder copy', async () => {
    let tree: renderer.ReactTestRenderer;

    await act(async () => {
      tree = renderer.create(<HomeScreen />);
    });

    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);

    expect(texts).toContain('Home placeholder');
    expect(texts).toContain('Router, SQLite, and persisted preferences are ready.');
  });
});
