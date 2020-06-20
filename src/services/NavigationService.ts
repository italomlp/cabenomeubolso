import {
  CommonActions,
  ParamListBase,
  NavigationContainerRef,
} from '@react-navigation/native';

let navigator: NavigationContainerRef;

function setTopLevelNavigator(navigatorRef: NavigationContainerRef) {
  navigator = navigatorRef;
}

function navigate(routeName: string, params?: ParamListBase) {
  if (navigator) {
    navigator.dispatch(CommonActions.navigate(routeName, params));
  }
}

export default {
  navigate,
  setTopLevelNavigator,
};
