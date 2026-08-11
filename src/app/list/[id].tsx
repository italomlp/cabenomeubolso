import { useLocalSearchParams, useRouter } from 'expo-router';

import ListDetailScreen from '@/components/planning/list-detail-screen';

export default function ListDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return <ListDetailScreen listId={id} onClose={() => router.back()} />;
}
