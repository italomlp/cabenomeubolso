import produce from 'immer';
import { Action } from 'redux';

import { TYPES } from './actions';

export type State = {
  introViewed: boolean;
};

const INITIAL_STATE: State = {
  introViewed: false,
};

export default function meta(state = INITIAL_STATE, action: Action) {
  return produce(state, draft => {
    switch (action.type) {
      case TYPES.markIntroAsViewed:
        draft.introViewed = true;
        break;
      default:
    }
  });
}
