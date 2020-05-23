import { Cabe, CanonCabe } from 'models/Cabe';

const PREFIX = '@cabes';

export const TYPES = {
  listCabesRequest: `${PREFIX}/LIST_CABES_REQUEST`,
  listCabesSuccess: `${PREFIX}/LIST_CABES_SUCCESS`,

  getCabeRequest: `${PREFIX}/GET_CABE_REQUEST`,
  getCabeSuccess: `${PREFIX}/GET_CABE_SUCCESS`,

  createCabeRequest: `${PREFIX}/CREATE_CABE_REQUEST`,
  createCabeSuccess: `${PREFIX}/CREATE_CABE_SUCCESS`,

  updateCabeRequest: `${PREFIX}/UPDATE_CABE_REQUEST`,
  updateCabeSuccess: `${PREFIX}/UPDATE_CABE_SUCCESS`,

  removeCabeRequest: `${PREFIX}/REMOVE_CABE_REQUEST`,
  removeCabeSuccess: `${PREFIX}/REMOVE_CABE_SUCCESS`,

  cabesFailure: `${PREFIX}/CABES_FAILURE`,
};

export function listCabesRequest() {
  return {
    type: TYPES.listCabesRequest,
  };
}

export function listCabesSuccess(cabes: Cabe[]) {
  return {
    type: TYPES.listCabesSuccess,
    payload: { cabes },
  };
}

export function cabesFailure() {
  return {
    type: TYPES.cabesFailure,
  };
}

export function getCabeRequest(id: number) {
  return {
    type: TYPES.getCabeRequest,
    payload: { id },
  };
}

export function getCabeSuccess(cabe: Cabe) {
  return {
    type: TYPES.getCabeSuccess,
    payload: { cabe },
  };
}

export function createCabeRequest(cabe: CanonCabe, onCreateSuccess?: Function) {
  return {
    type: TYPES.createCabeRequest,
    payload: { cabe, onCreateSuccess },
  };
}

export function createCabeSuccess(cabe: Cabe) {
  return {
    type: TYPES.createCabeSuccess,
    payload: { cabe },
  };
}

export function updateCabeRequest(cabe: CanonCabe) {
  return {
    type: TYPES.updateCabeRequest,
    payload: { cabe },
  };
}

export function updateCabeSuccess(cabe: Cabe) {
  return {
    type: TYPES.updateCabeSuccess,
    payload: { cabe },
  };
}

export function removeCabeRequest(id: number) {
  return {
    type: TYPES.removeCabeRequest,
    payload: { id },
  };
}

export function removeCabeSuccess(id: number) {
  return {
    type: TYPES.removeCabeSuccess,
    payload: { id },
  };
}
