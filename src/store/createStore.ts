import { createStore, compose, applyMiddleware } from 'redux';

export default (reducers: any, middlewares: any) => {
  const composer =
    process.env.NODE_ENV === 'development'
      ? compose(console.tron.createEnhancer(), applyMiddleware(...middlewares))
      : compose(applyMiddleware(...middlewares));

  return createStore(reducers, composer);
};
