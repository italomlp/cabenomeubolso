# Operations and Android-first release runbook

This runbook records how V2 is delivered and released. It is the operational companion to
[architecture](./architecture.md) ("Operational constraints"), [development builds](./development-builds.md),
and [roadmap Epic 8](./roadmap/08-monetization-and-operations.md).

## Status

- **Android is the initial store release.** iOS remains a native target but has **no store release** — no Apple
  Developer account is available. Its AdMob boundary stays a no-op (public test App ID only).
- **Ads are installed but flag-disabled.** `DEFAULT_ADS_RELEASE_FLAG` is `false`; no ad request is made until an
  intentional release decision flips it. This runbook does not enable ads.

## Delivery modes

Pick the mode by what you need to validate. These are mutually distinct and are never interchangeable.

| Mode | Command | Purpose | AdMob runs? |
|---|---|---|---|
| Expo Go | `npx expo start` | Fast JS-only preview | No — never validate AdMob here |
| Development build | `npx eas build --profile development --platform android` + `npx expo start --dev-client` | Validate native modules, consent flow, and test ads | Yes, test IDs/test devices only |
| Release build | `npx eas build --profile production --platform android` | Final production binary | Only after flag enable + consent + privacy review |
| OTA update | `npx eas update --branch <channel>` | Ship JS/assets to already-installed compatible builds | Only if the native runtime already shipped it |

Rules:

- Native modules (AdMob, tracking transparency, config-plugin output) require a development or release build;
  Expo Go cannot load them.
- Never click production ads during testing. Use Google's public test App IDs and test devices in development.
- Use a release build to exercise the full EAS Update path end to end.

## EAS Update channels and runtime version

Channels are named delivery targets; a `runtimeVersion` couples an update to a compatible native binary.

Proposed channel map (production values are **gated on owner question 8** and must not be set without confirmation):

| Channel | Audience |
|---|---|
| `development` | Development builds |
| `preview` | Internal/testers before production |
| `production` | Store users |

Procedure:

1. Set a `runtimeVersion` policy in `app.json` (`expo-updates`). For a native-module app, lead with
   `{ "policy": "nativeVersion" }` (rejects updates unless the native binary itself was rebuilt) or
   `{ "policy": "fingerprint" }` (rejects on any native change detected by the build fingerprint).
   If `appVersion` is used, it is safe only when every native change bumps the app version — native-only
   patches that do not touch `android.versionCode` or `ios.bundleVersion` will bypass this check.
2. Publish JS/assets to a channel with `npx eas update --branch <channel>`.
3. Configure the build profile to embed its channel so installs receive that channel's updates.

Compatibility rule: an update is installable only on a build whose `runtimeVersion` matches. Any native change
listed below requires a **new build**, not an OTA update.

## Native rebuild triggers

Any of the following invalidates OTA compatibility and requires a new native build:

- Adding, removing, or upgrading a native dependency (e.g. `react-native-google-mobile-ads`, `expo-tracking-transparency`).
- Editing a config plugin or `app.json` plugin entry (AdMob App IDs, supported locales, splash/icon native settings).
- Bumping the Expo SDK or React Native version.
- Changing the Android App ID / application ID.
- Changing the native supported-locale list.

A JS-only change (screens, adapters, translation resources, domain rules, SQL migrations in JS) is OTA-compatible,
provided the native runtime already supports it.

## AdMob enablement procedure

Owner question 7 confirms only that ads are **disabled by default** with restricted placements; no ad request is made. Enabling ads is a **separate, still-open release decision** that requires the privacy prerequisites below. Do not flip the flag until that decision and its prerequisites are resolved.

1. Supply the **Android App ID** (never ad-unit IDs in the config plugin).
2. Obtain consent **before** `initialize()`. `AdService.prepare()` already orders this:
   gather consent → request configuration → initialize, and it refuses to render while consent is missing
   (`reason: 'consent-required'` / `'privacy-options-required'`).
3. Keep test IDs/test devices in development (`resolveAdRequestConfiguration` injects them only when `isDevelopment`).
4. iOS stays a no-op until a deliberate enablement path swaps in a real App ID; it uses the public test App ID today.
5. Record privacy policy, store data-safety disclosures, and the consent/ATT/privacy-options review before release.

Flip by changing the release flag source to `true` (currently `DEFAULT_ADS_RELEASE_FLAG = false` in
`src/lib/ads/ad-service.ts`) as a deliberate release change — not by accident.

## Android release checklist

Before a production release, assign an owner and complete:

- [ ] App identity, package IDs, store listing, signing credentials (owner question 1 — store identity).
- [ ] EAS Update channels and `runtimeVersion` policy (owner question 8).
- [ ] Privacy policy, data-safety disclosures, and AdMob consent/ATT/privacy-options review (owner question 7).
- [ ] CI quality gates (`lint`, `typecheck`, `test`, `npx expo-doctor@latest`).
- [ ] Beta distribution and supported-device matrix.
- [ ] Rollback procedure and support owner.

## Rollback

- **OTA:** re-publish the previously-known-good update to the same channel, or point the channel at an earlier update.
- **Native:** re-release the prior binary; a bad native change cannot be fixed by an OTA update.

## Command reference

```bash
# Development build + Metro (AdMob/consent validation)
npx eas build --profile development --platform android
npx expo start --dev-client

# Production binary
npx eas build --profile production --platform android

# OTA publish to a channel
npx eas update --branch preview

# Quality gates
npm run lint
npm run typecheck
npm run test
npx expo-doctor@latest
```
