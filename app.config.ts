import { createAdMobPluginConfig } from './admob.config.js';

type ExpoAppConfig = {
  plugins?: unknown[];
  [key: string]: unknown;
};

type ConfigContext = {
  config: ExpoAppConfig;
};

export default ({ config }: ConfigContext): ExpoAppConfig => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['react-native-google-mobile-ads', createAdMobPluginConfig()],
  ],
});
