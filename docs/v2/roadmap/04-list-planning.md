# Epic 4: List planning

## Goal

Let a user create, edit, and resume an offline budgeted list.

## Scope / non-scope

**Scope:** Home, create/edit list, planned items, parsing, summaries. **Non-scope:** purchase execution, ads, currency conversion.

## Prerequisites

- [ ] Epic 2 design-system foundations.
- [ ] Epic 3 repositories/calculations.
- [ ] Language and new-list currency resolution from Epic 1.

## Tasks

- [ ] **4.1 Build Home and create-list form with shared adapters.** Show active/finalized summaries; present proposed BRL/USD currency before budget input. **Files:** Home/create routes/tests. **Estimate:** 2h. **Dependencies:** Epics 2–3. **Verification:** empty/populated states and explicit currency persist without raw controls or screen-specific colors.
- [ ] **4.2 Build planned-item editor.** Use exactly `piece`, `pack`, `kg`, `g`, `l`, `ml` and price-per-selected-unit labels. **Files:** editor/components/i18n. **Estimate:** 2h. **Dependencies:** 4.1. **Verification:** language-neutral unit codes persist.
- [ ] **4.3 Add locale-aware input boundary.** Keep raw text while focused; parse on commit/blur to minor units/`quantity_milli`. **Files:** parsers/forms/tests. **Estimate:** 2h. **Dependencies:** 4.2. **Verification:** `1,5 kg` PT and `1.5 kg` EN pass; ambiguity does not reach repositories.
- [ ] **4.4 Add edit/remove and integration flow.** **Files:** routes/use cases/integration tests. **Estimate:** 2h. **Dependencies:** 4.1–4.3. **Verification:** create `Compra semanal` with `2 piece`, `500 g`, `1.5 kg`, then reopen exact values.

## Files anticipated

Planning/Home routes, form components, parsers, translations, and integration tests.

## Dependencies

Requires Epics 2 and 3; blocks Epic 5, enables the Home ad placement in Epic 8, and supplies a core flow for Epic 7.

## Validation / exit criteria

Users can plan, edit, and relaunch a list offline without changing its currency.

## Test coverage

PT/EN parsing, BRL/USD formatting, unit category/overflow tests, planning-flow integration test.

## Risks

Keyboard formatting and locale ambiguity; retain raw input and reject ambiguous values.

## Updated estimate

**14–18h, high complexity.**
