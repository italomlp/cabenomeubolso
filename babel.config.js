module.exports = function(api) {
  api.cache(true);
  // TODO fix bug: this code is breaking development environment and
  // is needed for release builds
  // if (process.env.NODE_ENV !== 'development') {
  //   console.log('passa aqui')
  //   return {
  //     presets: ['module:metro-react-native-babel-preset'],
  //     plugins: [
  //       'transform-remove-console',
  //       'ignite-ignore-reactotron',
  //       [
  //         'module-resolver',
  //         {
  //           root: ['./src'],
  //           extensions: [
  //             '.ios.js',
  //             '.android.js',
  //             '.js',
  //             '.ts',
  //             '.tsx',
  //             '.json',
  //           ],
  //         },
  //       ],
  //     ],
  //   };
  // }
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
    ],
  };
};
