import { all, takeLatest, call, put } from 'redux-saga/effects';
import { Action } from 'redux';

import NavigationService from 'services/NavigationService';
import RealmAPI from 'services/bd';

import {
  TYPES,
  listCabesSuccess,
  cabesFailure,
  getCabeSuccess,
  createCabeSuccess,
  updateCabeSuccess,
  removeCabeSuccess,
} from './actions';

export function* listCabes() {
  try {
    const response = yield call(RealmAPI.getAllCabes);

    // console.tron.log('response', response);

    yield put(listCabesSuccess(response));
  } catch (error) {
    // console.tron.log(error.message);
    yield put(cabesFailure());
  }
}

export function* getCabe({ payload }: Action) {
  try {
    const { id } = payload;

    const response = yield call(RealmAPI.getCabeById, id);

    yield put(getCabeSuccess(response));
  } catch (error) {
    // console.tron.log('error', error);
    yield put(cabesFailure());
  }
}

export function* updateCabe({ payload }: Action) {
  try {
    const { cabe } = payload;

    const response = yield call(RealmAPI.updateCabe, cabe);

    yield put(updateCabeSuccess(response));
    NavigationService.navigate('Main');
  } catch (error) {
    // console.tron.log('error', error.message);
    yield put(cabesFailure());
  }
}

export function* createCabe({ payload }: Action) {
  try {
    const { cabe } = payload;

    const response = yield call(RealmAPI.createCabe, cabe);

    yield put(createCabeSuccess(response));
    if (payload && payload.onCreateSuccess) {
      payload.onCreateSuccess(response);
    } else {
      NavigationService.navigate('Main');
    }
  } catch (error) {
    yield put(cabesFailure());
  }
}

export function* removeCabe({ payload }: Action) {
  try {
    const { id } = payload;

    yield call(RealmAPI.deleteCabe, id);

    yield put(removeCabeSuccess(id));
  } catch (error) {
    // console.tron.log('error', error, error.message);
    yield put(cabesFailure());
  }
}

export default all([
  takeLatest(TYPES.listCabesRequest, listCabes),
  takeLatest(TYPES.getCabeRequest, getCabe),
  takeLatest(TYPES.createCabeRequest, createCabe),
  takeLatest(TYPES.updateCabeRequest, updateCabe),
  takeLatest(TYPES.removeCabeRequest, removeCabe),
]);
