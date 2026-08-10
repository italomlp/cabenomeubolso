import { useRouter } from 'expo-router';

import HomeScreen from '@/components/planning/home-screen';

export default function HomeRoute() {
  const router = useRouter();

  return (
    <HomeScreen
      onOpenList={(listId) => router.push({ pathname: '/list/[id]', params: { id: listId } })}
      onOpenNewList={() => router.push('/list/new')}
      routeIntent={{ kind: 'home' }}
    />
  );
}
