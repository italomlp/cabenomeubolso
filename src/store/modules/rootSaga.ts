import { all } from 'redux-saga/effects';

import cabes from './cabes/sagas';

export default function* rootSaga() {
  return yield all([cabes]);
}
