# Epic 3: Domain and persistence

## Goal

Persist money-safe, unit-aware shopping lists through testable SQLite repositories.

## Scope / non-scope

**Scope:** types, integer calculations, migrations, repositories, transactions. **Non-scope:** screens, recurrence UI, sync, conversion, floats.

## Prerequisites

- [ ] Epic 1 SQLite migration harness. This epic may run in parallel with Epic 2.
- [ ] Product rules in [data and rules](../data-and-rules.md) retained.

## Tasks

- [ ] **3.1 Define domain invariants and calculations.** Money is minor units; `quantity_milli` is thousandths of selected unit. **Files:** domain types/calculations/tests. **Estimate:** 2h. **Dependencies:** Epic 1. **Verification:** BRL/USD and kg/g examples use integer math only.
- [ ] **3.2 Implement schema and ordered migrations.** Lists/items include ISO currency, unit codes, deletion/status fields, indexes, and `user_version`. **Files:** SQL migrations/repository tests. **Estimate:** 2h. **Dependencies:** 3.1. **Verification:** fresh migration is repeatable with foreign keys/WAL.
- [ ] **3.3 Implement repository reads and atomic writes.** Map rows to domain models and transactionally save list/item mutations. **Files:** repository/use cases/tests. **Estimate:** 2h. **Dependencies:** 3.2. **Verification:** injected write failure leaves no partial data.
- [ ] **3.4 Implement purchase/actual-price behavior.** Require explicit actual price on purchase; preserve approved uncomplete policy. **Files:** use cases/tests. **Estimate:** 2h. **Dependencies:** 3.3. **Verification:** actual totals change exactly once and exclude unpurchased items.
- [ ] **3.5 Add upgrade and boundary fixtures.** **Files:** migration/calculation fixtures. **Estimate:** 2h. **Dependencies:** 3.2–3.4. **Verification:** prior V2 schema preserves records/currency/unit/quantity data.

## Files anticipated

Domain, repository, SQL migration, and test files; [`docs/v2/data-and-rules.md`](../data-and-rules.md).

## Dependencies

Requires Epic 1 only; may run in parallel with Epic 2. Blocks Epics 4–6 and release persistence validation.

## Validation / exit criteria

Repositories atomically persist lists/items and reproduce planned/actual totals from records.

## Test coverage

Unit calculation/validation tests; SQLite migration, rollback, deleted-row filtering, and upgrade integration tests.

## Risks

Precision or migration loss; mitigate with integer fixtures and transactional upgrades.

## Updated estimate

**12–16h, high complexity.**
