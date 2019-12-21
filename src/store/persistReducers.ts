import { persistReducer } from 'redux-persist';
import { Reducer } from 'redux';
import AsyncStorage from '@react-native-community/async-storage';

export default (reducers: Reducer) => {
  const persistedReducer = persistReducer(
    {
      key: 'cabenomeubolso',
      storage: AsyncStorage,
      whitelist: ['meta'],
    },
    reducers
  );
  return persistedReducer;
};
