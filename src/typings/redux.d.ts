import { Action as DefaultAction } from 'redux';

declare module 'redux' {
  export interface Action<T = any, P = any> extends DefaultAction {
    payload?: P;
  }
}
