import produce from 'immer';
import { Action } from 'redux';

import { TYPES } from './actions';

export type State = {
  introSawn: boolean;
};

const INITIAL_STATE: State = {
  introSawn: false,
};

export default function meta(state = INITIAL_STATE, action: Action) {
  return produce(state, draft => {
    switch (action.type) {
      case TYPES.markIntroAsSawn:
        draft.introSawn = true;
        break;
      default:
    }
  });
}
