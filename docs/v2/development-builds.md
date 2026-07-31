# Development builds

## What runs where

- **Expo Go**: useful for JS-only preview, but it cannot validate custom native modules.
- **Development build**: required for native module validation, including AdMob and any config-plugin changes.
- **Release build**: final production binary; use it to verify native-runtime behavior before shipping.

## Native locale support

This app declares native support for `pt-BR` and `en` in `app.json` through `expo-localization`.

## Android development-build smoke path

1. Create the development client configuration from `eas.json`.
2. Build an Android development APK with the development profile.
3. Install that build on a device or emulator.
4. Start Metro with the dev-client entrypoint and open the installed client.

Command reference:

```bash
npx eas build --profile development --platform android
npx expo start --dev-client
```

## AdMob note

AdMob is installed but disabled by default. It is **not validated in Expo Go**; test it only in a development or release build with test IDs or test devices.
