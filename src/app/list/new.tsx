import { useRouter } from 'expo-router';

import CreateListScreen from '@/components/planning/create-list-screen';

export default function CreateListRoute() {
  const router = useRouter();

  return <CreateListScreen onClose={() => router.back()} />;
}
