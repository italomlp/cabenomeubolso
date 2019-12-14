import { combineReducers } from 'redux';

import cabes, { State as CabesState } from './cabes/reducer';
import meta, { State as MetaState } from './meta/reducer';

const reducers = combineReducers({
  cabes,
  meta,
});

export type RootStore = {
  cabes: CabesState;
  meta: MetaState;
};

export default reducers;
