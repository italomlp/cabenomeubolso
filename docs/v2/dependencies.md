# V2 dependencies

## Baseline and installation policy

Create the clean app; do not upgrade the legacy application in place:

```sh
npx create-expo-app@latest cabe-v2 --template default@sdk-57
npx expo install expo-router expo-sqlite expo-localization @expo/ui expo-updates expo-dev-client react-native-google-mobile-ads @react-native-async-storage/async-storage expo-tracking-transparency eslint-config-expo jest-expo
npm install zustand@5.0.14 i18next@26.3.6 react-i18next@17.0.11
npx expo-doctor@latest
```

SDK 57.0.0 uses React Native 0.86.0, React 19.2.3, and Node 22.13.x+. `react-native-google-mobile-ads@16.4.0` is the researched release; install it with `npx expo install react-native-google-mobile-ads`, record the resolved version in the V2 lockfile, and validate it in an SDK 57 development build. Do not state unverified exact versions for Expo-managed packages, `jest`, or `@testing-library/react-native`; resolve the latter two through Expo’s unit-test setup.

## Catalog and boundaries

| Dependency | Version/install policy | Role and boundary |
|---|---|---|
| Expo / React Native / React | SDK 57.0.0 / 0.86.0 / 19.2.3 | managed runtime baseline |
| `expo-router` | `expo install` | routes/layouts only; do not add legacy React Navigation packages |
| `expo-sqlite` | `expo install` | SQLite adapter; SQL stays in repositories, parameterized and transactional |
| `zustand` | 5.0.14 | small UI/preferences state only, never domain-record source of truth |
| `expo-localization` | `expo install` | configured locale/region input; never physical location or timezone currency inference |
| `i18next` / `react-i18next` | 26.3.6 / 17.0.11 | bundled `pt-BR`/`en` resources; no remote translations |
| `@react-native-async-storage/async-storage` | `expo install` | persisted versioned preferences only |
| `@expo/ui` | `expo install` | universal native UI first, through project adapters and `Host` |
| `expo-updates` | `expo install` | EAS Update-compatible JS/assets; native changes need builds |
| `expo-dev-client` | `expo install` | native development builds |
| `react-native-google-mobile-ads` | 16.4.0; install via `expo install` | isolated `AdService`; flag disabled by default |
| `expo-tracking-transparency` | `expo install`; iOS runtime only | ATT before personalized-ad initialization where applicable |
| `eslint-config-expo`, `jest-expo` | `expo install` | lint and Expo-compatible test baseline |

## Native configuration and builds

- Add/configure the Router and localization plugins as implementation requires; supported native locales are `pt-BR` and `en`.
- AdMob’s config plugin needs Android/iOS **App IDs**, not ad-unit IDs. Obtain consent before `mobileAds().initialize()`; request ATT on iOS where applicable.
- AdMob does not run in Expo Go. Test it with package `TestIds`/test devices in a development build; never click production ads during testing. Plugin, native-dependency, SDK, or App-ID changes require a rebuild.
- Configure EAS Update only after choosing channels and a `runtimeVersion` policy. Updates are compatible only with matching native runtime; use a release build to test the full update path.

## Excluded or deferred

Do not install Redux, Redux Saga, Redux Persist, Realm, CodePush, legacy React Navigation, Drizzle, Supabase/Firebase clients, purchase/billing or analytics SDKs, remote translation tooling, or a generic UI library. Store identity and an iOS store release are deferred; Android is the initial release target.
