# Epic 1: Expo stack foundation

## Goal

Create a clean, runnable Expo SDK 57 foundation with navigation, preferences, localization, and SQLite bootstrap.

## Scope / non-scope

**Scope:** SDK 57, Router, SQLite, preferences, bilingual bootstrap, testing/linting, and native build setup. **Non-scope:** legacy migration, business features, live ads, or a store release.

## Prerequisites

- [ ] Clean-database/no-legacy-migration decision accepted.
- [ ] Node 22.13.x+ available.

## Tasks

- [x] **1.1 Scaffold and verify SDK 57.**
- [x] **1.2 Install and configure selected dependencies.**
- [x] **1.3 Add Router, SQLite, and preference shell.**
- [x] **1.4 Add localization and default resolution.**
- [x] **1.5 Prepare native development builds.**

## Files anticipated

App/config/lock/test files created by implementation; [`docs/v2/dependencies.md`](../dependencies.md), [`docs/v2/architecture.md`](../architecture.md).

## Dependencies

Blocks Epics 2, 3, and 8. Epics 2 and 3 may proceed in parallel. Requires no owner store-identity decision.

## Validation / exit criteria

A clean SDK 57 app navigates, persists preferences, resolves bilingual UI/default currency correctly, and initializes an empty versioned SQLite database.

## Test coverage

Unit tests for language/currency resolution and preference hydration; smoke test Router/SQLite; Android development-build smoke test.

## Risks

Expo-managed version drift or native plugin incompatibility; mitigate with lockfile, `expo-doctor`, and development-build validation.

## Updated estimate

**14–18h, high complexity.**
