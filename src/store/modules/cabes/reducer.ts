import produce from 'immer';
import { Action } from 'redux';

import { Cabe } from '@app/models/Cabe';

import { TYPES } from './actions';

export type State = {
  list: Cabe[];
  current: Cabe | null;
  loading: boolean;
};

const INITIAL_STATE: State = {
  list: [],
  current: null,
  loading: false,
};

export default function cabes(state = INITIAL_STATE, action: Action) {
  return produce(state, draft => {
    switch (action.type) {
      case TYPES.listCabesRequest:
        draft.loading = true;
        break;
      case TYPES.listCabesSuccess:
        draft.list = action.payload.cabes;
        draft.loading = false;
        break;
      case TYPES.cabesFailure:
        draft.loading = false;
        break;
      case TYPES.getCabeRequest:
        draft.loading = true;
        if (draft.current && draft.current.id !== action.payload.id) {
          draft.current = null;
        }
        break;
      case TYPES.getCabeSuccess:
        draft.loading = false;
        draft.current = action.payload.cabe;
        break;
      case TYPES.createCabeRequest:
        draft.loading = true;
        break;
      case TYPES.createCabeSuccess:
        draft.loading = false;
        draft.list.push(action.payload.cabe);
        break;
      case TYPES.updateCabeRequest:
        draft.loading = true;
        break;
      case TYPES.updateCabeSuccess: {
        draft.loading = false;
        const index = draft.list.findIndex(
          c => c.id === action.payload.cabe.id,
        );
        draft.list[index] = { ...draft.list[index], ...action.payload.cabe };
        break;
      }
      case TYPES.removeCabeRequest:
        draft.loading = true;
        break;
      case TYPES.removeCabeSuccess: {
        draft.loading = false;
        const index = draft.list.findIndex(c => c.id === action.payload.id);
        draft.list.splice(index, 1);
        draft.current = null;
        break;
      }
      default:
    }
  });
}
