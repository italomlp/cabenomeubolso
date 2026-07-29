# Epic 9: Release readiness

## Goal

Prove the offline core is releasable and make accurate Android-first release claims.

## Scope / non-scope

**Scope:** regression, migration, native-build, accessibility, and store-readiness evidence. **Non-scope:** changing scope to add sync, iOS store submission, or live ads without explicit enablement.

## Prerequisites

- [ ] Epics 1–8 completed and their exit criteria met, including Epic 7 visual polish and accessibility.
- [ ] Store identity decision supplied before listing/credentials work.
- [ ] EAS/runtime policy and privacy disclosures reviewed.

## Tasks

- [ ] **9.1 Run clean-install offline journey.** Create → shop → finalize → trash/restore → template generation with network disabled. **Files:** E2E checklist/results. **Estimate:** 2h. **Dependencies:** Epics 1–8. **Verification:** data persists across relaunch without network.
- [ ] **9.2 Run deterministic quality suite in CI.** Calculations, parsers, repositories, migration upgrades, and rollback. **Files:** CI/tests/results. **Estimate:** 2h. **Dependencies:** Epics 3–6. **Verification:** all deterministic tests pass from clean checkout.
- [ ] **9.3 Execute matrix and accessibility regression.** PT/EN × BRL/USD × unit category; themes, dynamic type, screen readers, reduced motion. **Files:** matrix/audit results. **Estimate:** 2h. **Dependencies:** Epics 4–7. **Verification:** currency never changes with language; whole/decimal unit rules hold.
- [ ] **9.4 Validate builds and update policy.** Android development/release build smoke tests; release-build update validation where configured. **Files:** build/update evidence. **Estimate:** 2h. **Dependencies:** Epics 1 and 8. **Verification:** distinguish Expo Go limitations from native build behavior.
- [ ] **9.5 Prepare Android release evidence and acceptance.** Accurate listing/screenshots/privacy/data-safety, ads declaration only if enabled, owner walkthrough and deferred-work log. **Files:** release checklist/acceptance record. **Estimate:** 2h. **Dependencies:** 9.1–9.4, store identity. **Verification:** claims match disabled/enabled ad state and local-only scope.

## Files anticipated

CI/test artifacts, regression matrices, build/release checklists, Android listing assets and owner acceptance record.

## Dependencies

Requires every prior epic. Android release is blocked by the deferred store-identity decision; iOS store release is out of scope without an Apple Developer account.

## Validation / exit criteria

The documented V2 scope works offline in tested native builds, quality evidence passes, and release material makes no unsupported claim.

## Test coverage

Full unit/repository/UI suite; offline E2E; PT/EN × BRL/USD × unit matrix; native-build, accessibility, and update-policy smoke tests.

## Risks

Store identity, store review, device coverage, and privacy disclosures can delay release. Track them as release gates; do not block core development on them.

## Updated estimate

**10–14h, high complexity.**
