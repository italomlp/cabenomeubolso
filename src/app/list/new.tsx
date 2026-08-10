import HomeScreen from '../index';

export default function CreateListRoute() {
  return <HomeScreen routeIntent={{ kind: 'new-list' }} />;
}
