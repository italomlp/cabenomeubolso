# Epic 2: Design-system foundations

## Goal

Establish the shared UI boundary before any feature UI is built.

## Scope / non-scope

**Scope:** semantic tokens, theme resolver, `@expo/ui` `Host`, universal adapters, and documented platform-isolated exceptions. **Non-scope:** feature-screen polish, cross-flow state refinement, or the full accessibility audit.

## Prerequisites

- [ ] Epic 1 packages and theme-preference shell.
- [ ] Owner-approved visual direction recorded.

## Tasks

- [ ] **2.1 Define tokens, theme resolver, and `Host`.** Create semantic color/type/space/motion contracts, System/Light/Dark resolution, and the `@expo/ui` host boundary. **Files:** design system/theme/host/tests. **Estimate:** 2h. **Dependencies:** Epic 1. **Verification:** a sample route resolves every mode without screen-specific colors.
- [ ] **2.2 Create universal adapters and isolate exceptions.** Provide project adapters, including `AppButton`, `AppTextField`, `AppSelect`, `AppSheet`, and `AdSlot`; document and implement only missing universal capabilities in `*.ios`/`*.android` adapters. **Files:** adapters/platform adapters/decision notes/tests. **Estimate:** 2h. **Dependencies:** 2.1. **Verification:** feature code can import adapters only; no raw platform control escapes the boundary.

## Files anticipated

Design-token/theme files, `Host`, universal and platform-isolated adapters, and tests; [V2 design system](../design-system.md).

## Dependencies

Requires Epic 1; unblocks feature UI in Epics 4–6 and the `AdSlot` foundation in Epic 8. Epic 3 may run in parallel.

## Validation / exit criteria

Semantic tokens, theme resolution, `Host`, adapters, and isolated exceptions are available before feature screens are implemented.

## Test coverage

Theme-resolver and adapter-boundary tests; Light/Dark/System sample-route smoke test.

## Risks

Universal component gaps can fragment screens; document each gap and contain it in a platform adapter.

## Updated estimate

**4–6h, medium complexity.**
