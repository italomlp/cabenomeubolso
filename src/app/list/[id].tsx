import { useLocalSearchParams } from 'expo-router';

import HomeScreen from '../index';

export default function ListDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <HomeScreen routeIntent={{ kind: 'list-detail', listId: id }} />;
}
