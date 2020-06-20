/* eslint-disable import/no-extraneous-dependencies */
import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import sagaPlugin from 'reactotron-redux-saga';

import AsyncStorage from '@react-native-community/async-storage';

if (__DEV__) {
  const { scriptURL } = NativeModules.SourceCode;
  const scriptHostname = scriptURL.split('://')[1].split(':')[0];

  if (Reactotron.setAsyncStorageHandler) {
    const tron = Reactotron.setAsyncStorageHandler(AsyncStorage)
      .configure({
        name: 'cnmb',
        host: scriptHostname,
      })
      .useReactNative()
      .use(reactotronRedux())
      .use(sagaPlugin({}))
      .connect();

    if (tron && tron.clear) {
      tron.clear();
    }

    console.tron = tron as typeof console.tron;
  }
} else {
  console.tron = ({
    log: () => {},
    logImportant: () => {},
    error: () => {},
  } as unknown) as typeof console.tron;
}
