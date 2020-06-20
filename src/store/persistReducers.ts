import AsyncStorage from '@react-native-community/async-storage';
import { Reducer } from 'redux';
import { persistReducer } from 'redux-persist';

export default (reducers: Reducer) => {
  const persistedReducer = persistReducer(
    {
      key: 'cabenomeubolso',
      storage: AsyncStorage,
      whitelist: ['meta'],
    },
    reducers,
  );
  return persistedReducer;
};
