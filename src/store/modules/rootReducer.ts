import { combineReducers } from 'redux';

import cabes, { State as CabesState } from './cabes/reducer';

const reducers = combineReducers({
  cabes,
});

export type RootStore = {
  cabes: CabesState;
};

export default reducers;
