# Epic 6: Trash and recurrence

## Goal

Provide seven-day recovery and independent reusable templates.

## Scope / non-scope

**Scope:** soft delete, restore/purge, Trash, templates, manual generation. **Non-scope:** background scheduling/notifications and linked occurrences.

## Prerequisites

- [ ] Epics 2, 3, and 5.
- [ ] Owner decisions on permanent delete, cleanup trigger, and recurrence cadence recorded if they supersede defaults.

## Tasks

- [ ] **6.1 Add delete/restore/purge use cases.** Seven-day expiry and parent/child transaction rules. **Files:** migrations/repositories/tests. **Estimate:** 2h. **Dependencies:** Epic 3. **Verification:** restore/purge preserves documented individually deleted items.
- [ ] **6.2 Build delete feedback and Trash with shared adapters.** Confirmation, Undo, expiry, restore, permanent delete. **Files:** UI/routes/i18n/tests. **Estimate:** 2h. **Dependencies:** Epics 2 and 6.1. **Verification:** normal views hide deleted rows immediately without raw controls or screen-specific colors.
- [ ] **6.3 Add template schema and snapshot conversion.** **Files:** migrations/repositories/use cases/tests. **Estimate:** 2h. **Dependencies:** 6.1, Epic 5. **Verification:** snapshot preserves currency/unit/quantity and no actual data.
- [ ] **6.4 Build Templates and Generate now.** **Files:** templates route/components/tests. **Estimate:** 2h. **Dependencies:** 6.3. **Verification:** occurrence has new IDs and does not change after template edits.

## Files anticipated

Migrations, lifecycle/template repositories and use cases, Trash/Templates routes, tests.

## Dependencies

Requires Epics 2, 3, and 5; supplies a core flow for Epic 7 and blocks complete regression in Epic 9.

## Validation / exit criteria

Seven-day recovery and independent manual template generation work offline.

## Test coverage

Expiry boundary, nested restore, transaction purge, and template-independence tests.

## Risks

Background cleanup is unreliable; perform cleanup from owner-chosen foreground events.

## Updated estimate

**10–14h, medium-high complexity.**
