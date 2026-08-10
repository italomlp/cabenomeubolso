import HomeScreen from '@/components/planning/home-screen';

export default function CreateListRoute() {
  return <HomeScreen routeIntent={{ kind: 'new-list' }} />;
}
