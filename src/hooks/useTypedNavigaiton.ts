import { StackNavigationProp } from '@react-navigation/stack';
import {
  useNavigation,
  useRoute,
  ParamListBase,
  Route,
} from '@react-navigation/native';
import RouteParams from '@app/models/RouteParams';

export function useStackNavigation<
  ParamList extends ParamListBase,
  RouteName extends keyof RouteParams & keyof ParamList = never
>() {
  const navigation = useNavigation<
    StackNavigationProp<RouteParams & ParamList, RouteName>
  >();

  return navigation;
}

// TODO: check this typing with react navigation lib
type RouteProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList
> = Omit<Route<Extract<RouteName, string>>, 'params'> &
  (ParamList[RouteName] extends undefined
    ? {
        params: undefined;
      }
    : {
        params: ParamList[RouteName];
      });

export function useTypedRoute<
  RouteName extends keyof ParamList,
  ParamList extends RouteParams = RouteParams
>() {
  type Params = ParamList & ParamListBase;
  const route = useRoute<RouteProp<Params, RouteName>>();

  return route;
}
