import React from 'react';

import 'react-native-gesture-handler';
import 'config/ReactotronConfig';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'react-native-elements';

import { store } from 'store';
import Routes from 'routes';

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <Routes />
    </ThemeProvider>
  </Provider>
);

export default App;
