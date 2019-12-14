module.exports = function(api) {
  api.cache(true);
  if (process.env.NODE_ENV !== 'development') {
    return {
      presets: ['module:metro-react-native-babel-preset'],
      plugins: [
        'transform-remove-console',
        'ignite-ignore-reactotron',
        [
          'module-resolver',
          {
            root: ['./src'],
            extensions: [
              '.ios.js',
              '.android.js',
              '.js',
              '.ts',
              '.tsx',
              '.json',
            ],
          },
        ],
      ],
    };
  }
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
