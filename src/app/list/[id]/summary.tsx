import { useLocalSearchParams, useRouter } from 'expo-router';
import SummaryScreen from '@/components/shopping/summary-screen';
export default function SummaryRoute() { const { id } = useLocalSearchParams<{ id: string }>(); const router = useRouter(); return <SummaryScreen listId={id} onCloned={(nextId) => router.replace(`/list/${nextId}`)} />; }
