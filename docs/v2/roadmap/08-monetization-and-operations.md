# Epic 8: Monetization and operations

## Goal

Install and validate a safe, disabled-by-default AdMob boundary and define Android-first delivery operations.

## Scope / non-scope

**Scope:** installed AdMob SDK, `AdService`/entitlement/flags, two banner placements, consent/privacy/testing safeguards, EAS policy. **Non-scope:** enabled production ads, purchases, analytics, interstitials, rewarded ads, or an iOS store release.

## Prerequisites

- [ ] Epics 1 and 2 development-build and `AdSlot` foundations.
- [ ] Home and finalized Summary flows from Epics 4 and 5 before task 8.4 adds placements.
- [ ] Android App ID, release privacy review, and consent requirements available before enablement.

## Tasks

- [ ] **8.1 Install/configure and build-test AdMob.** Install via `npx expo install react-native-google-mobile-ads`; apply plugin/App IDs only when supplied; rebuild Android development client. **Files:** package/lock, app config, build config. **Estimate:** 2h. **Dependencies:** Epic 1. **Verification:** Android development build launches; Expo Go is not used for AdMob validation.
- [ ] **8.2 Implement `AdService`, entitlement, and release flag through `AdSlot`.** Flag defaults false; service owns SDK calls and screens receive only eligibility/slot state. **Files:** ads service/config/tests. **Estimate:** 2h. **Dependencies:** Epics 2 and 8.1. **Verification:** disabled state makes no SDK initialization/request.
- [ ] **8.3 Implement consent, ATT, and test-ad safeguards.** Refresh consent and show required form/privacy options before initialize; use `TestIds`/test devices in development; ATT is iOS-only runtime behavior. **Files:** consent service/settings/tests. **Estimate:** 2h. **Dependencies:** 8.2. **Verification:** initialization cannot precede consent path; no production ad IDs in development.
- [ ] **8.4 Add allowed placements only.** Adaptive banner after Home list content; inline banner in finalized Summary. **Files:** Home/Summary adapters/tests. **Estimate:** 2h. **Dependencies:** 8.2, Epics 4–5. **Verification:** no ad slot in planning or active shopping; no interstitial/rewarded code.
- [ ] **8.5 Define Android-first release/OTA procedure.** Configure EAS Update channels/runtime-version policy and native rebuild triggers. **Files:** release runbook/config. **Estimate:** 2h. **Dependencies:** 8.1. **Verification:** procedure distinguishes Expo Go, development builds, release builds, OTA-compatible changes, and Android release focus.

## Files anticipated

Ad/consent/entitlement services, feature flags, Home/Summary slots, app/build configuration, release runbook, tests.

## Dependencies

Requires Epic 1 and Epic 2 for the early `AdSlot` boundary; placements additionally require Epics 4–5. Must complete before Epic 9. Store identity remains a release gate, not a feature blocker.

## Validation / exit criteria

Flag-disabled builds make no ad requests. A consent-gated test-ad path works in an Android development build; only approved placements can render when deliberately enabled.

## Test coverage

Unit tests for flag/eligibility/order of consent initialization; placement integration tests; Android development-build manual test with test IDs; privacy-options regression.

## Risks

Native SDK/Android New Architecture issues and privacy noncompliance. Mitigate with exact-format Android testing, test IDs, consent-first initialization, and release disclosure review.

## Updated estimate

**10–14h, high complexity.**
