import { useLocalSearchParams, useRouter } from 'expo-router';
import ShoppingScreen from '@/components/shopping/shopping-screen';
export default function ShopRoute() { const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); return <ShoppingScreen listId={id} onSummary={(listId) => router.replace(`/list/${listId}/summary`)} />; }
