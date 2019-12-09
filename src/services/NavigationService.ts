import {
  NavigationActions,
  NavigationParams,
  NavigationContainerComponent,
} from 'react-navigation';

let navigator: NavigationContainerComponent;

function setTopLevelNavigator(navigatorRef: NavigationContainerComponent) {
  navigator = navigatorRef;
}

function navigate(routeName: string, params?: NavigationParams) {
  if (navigator) {
    navigator.dispatch(
      NavigationActions.navigate({
        routeName,
        params,
      })
    );
  }
}

export default {
  navigate,
  setTopLevelNavigator,
};
