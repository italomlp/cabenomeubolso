module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    jest: true,
  },
  extends: [
    'airbnb',
    'plugin:react-native/all',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    __DEV__: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: [
    'react',
    'react-native',
    '@typescript-eslint',
    'jsx-a11y',
    'import',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    ],
    'import/prefer-default-export': 'off',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/jsx-one-expression-per-line': 'off',
    'react-native/no-color-literals': 'off',
    'react-native/sort-styles': 'off',
    'global-require': 'off',
    'react-native/no-raw-text': 'off',
    'no-console': 'off',
    'react-native/no-inline-styles': 'warn',
    'no-param-reassign': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
      },
    ],
    'react/jsx-props-no-spreading': 'off',
  },
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
};
