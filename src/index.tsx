import React from 'react';

import 'react-native-gesture-handler';
import 'config/ReactotronConfig';
import 'react-native-get-random-values';

import { Provider } from 'react-redux';
import { ThemeProvider } from 'react-native-elements';
import CodePush from 'react-native-code-push';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';

import { store, persistor } from 'store';
import Routes from 'routes';
import NavigationService from 'services/NavigationService';

const App = () => (
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <ThemeProvider>
        <NavigationContainer
          ref={navigatorRef => {
            if (navigatorRef) {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }
          }}
        >
          <Routes />
        </NavigationContainer>
      </ThemeProvider>
    </PersistGate>
  </Provider>
);

export default CodePush({
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
})(App);
