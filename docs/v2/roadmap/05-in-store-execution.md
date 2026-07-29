# Epic 5: In-store execution

## Goal

Make active shopping fast while reporting actual spend truthfully.

## Scope / non-scope

**Scope:** shopping session, actual pricing, finalize, Summary, clone. **Non-scope:** ads in shopping, conversion, reopening finalized lists.

## Prerequisites

- [ ] Epic 2 design-system foundations.
- [ ] Epic 4 planning flow.
- [ ] Epic 3 purchase use cases.

## Tasks

- [ ] **5.1 Build active-shopping screen and sticky summary with shared adapters.** **Files:** shop route/summary components/tests. **Estimate:** 2h. **Dependencies:** Epics 2 and 4. **Verification:** planned/actual/remaining/overage are accessible and correct without raw platform controls.
- [ ] **5.2 Add purchase toggle and actual price.** **Files:** item controls/use cases/tests. **Estimate:** 2h. **Dependencies:** 5.1. **Verification:** `2 × BRL 6.50` is BRL 13.00; `1.5 kg × BRL 2.00` is BRL 3.00.
- [ ] **5.3 Add in-session create/edit.** Support item/list budget and explicit unit-price changes. **Files:** inline forms/routes/tests. **Estimate:** 2h. **Dependencies:** 5.2. **Verification:** totals refresh without reload; unit changes never convert values.
- [ ] **5.4 Finalize, Summary, and clone.** **Files:** confirmation/Summary/clone use cases/tests. **Estimate:** 2h. **Dependencies:** 5.1–5.3. **Verification:** unpurchased confirmation works; clone has new IDs and no actual/purchase state.
- [ ] **5.5 Add focused interaction accessibility checks.** Verify mutation focus and announcements through the shared adapters; the full bilingual/accessibility audit is Epic 7. **Files:** accessibility tests/checklist. **Estimate:** 2h. **Dependencies:** 5.4. **Verification:** TalkBack/VoiceOver announces over-budget change and focus survives mutations.

## Files anticipated

Shop/Summary routes, item controls, finalization/clone use cases, integration and accessibility tests.

## Dependencies

Requires Epics 2–4; blocks final workflow validation, enables Epic 6, and supplies Summary for the Epic 8 ad placement.

## Validation / exit criteria

A shopper can complete a trip, exceed budget without blockage, finalize, review, and clone offline.

## Test coverage

Actual-total fixtures, finalize-with-unpurchased and clone integration tests, manual screen-reader checks.

## Risks

Fast interaction can hide state changes; use immediate persistence, visible text status, and accessible announcements.

## Updated estimate

**12–16h, high complexity.**
