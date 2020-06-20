// eslint-disable-next-line import-helpers/order-imports
import React from 'react';

import 'react-native-gesture-handler';
import '@app/config/ReactotronConfig';
import 'react-native-get-random-values';

import CodePush from 'react-native-code-push';
import { ThemeProvider } from 'react-native-elements';
import { Provider } from 'react-redux';

import { NavigationContainer } from '@react-navigation/native';
import { PersistGate } from 'redux-persist/integration/react';

import Routes from '@app/routes';
import NavigationService from '@app/services/NavigationService';
import { store, persistor } from '@app/store';

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
