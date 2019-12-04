import { combineReducers } from 'redux';

const reducers = combineReducers({
  example: () => ({}),
});

// export type RootStore = {
//   auth: AuthState;
//   users: UsersState;
//   clients: ClientsState;
//   rounds: RoundsState;
//   user: UserState;
// };

export default reducers;
