# Epic 4 UI tech-debt delivery plan

## Objective

Finish the offline list-planning contract while replacing the monolithic Home composition with route-focused screens and reusable semantic UI. This plan implements only Epic 4 requirements and its prerequisite UI debt; it does not start shopping, Trash, Templates, or Settings work.

## Current baseline

- The planning editor preserves localized raw input and now accepts a prefilled item for editing.
- Route entry points exist for `/(tabs)/home`, `/list/new`, and `/list/[id]`.
- `src/app/index.tsx` still owns the Home, create, and detail compositions and must be split before adding further behavior.

## Phase 1 — Stabilize routes and screen ownership

**Goal:** Make each route own one screen flow and leave navigation/state orchestration small.

1. Extract the shared runtime composition and list-loading controller from `src/app/index.tsx`.
   - **Files:** `src/app/index.tsx`, new planning controller/runtime modules, route tests.
   - **Depends on:** current route-entry commit.
   - **Verify:** root redirects to `/(tabs)/home`; route screens contain no SQL or raw platform controls.
2. Split Home, create-plan, and list-detail content into focused screen components.
   - **Files:** `src/components/planning/home-screen.tsx`, `create-list-screen.tsx`, `list-detail-screen.tsx` (names may vary), route files.
   - **Depends on:** task 1.
   - **Verify:** Home has summaries and navigation only; create/detail own the form state; existing injected-runtime tests remain possible.

## Phase 2 — Add the reusable Epic 4 UI layer

**Goal:** Address UI-TD-01, UI-TD-05, and UI-TD-06 before wiring more planning behavior.

1. Add `AppScreen` and `AppFormSheet` adapters with documented safe-area, scroll, keyboard, save/cancel, and accessibility behavior.
   - **Files:** `src/components/ui/`, adapter tests, adapter exports.
   - **Depends on:** Phase 1 screen boundaries.
   - **Verify:** Light, Dark, and System themes render; forms retain raw input while focused and expose translated labels/hints.
2. Add `BudgetSummary`, `ListCard`, `GroceryItemRow`, and `AppEmptyState` planning composites.
   - **Files:** `src/components/planning/`, component tests.
   - **Depends on:** task 1.
   - **Verify:** budget status includes text as well as color; item/list actions meet 44 pt targets and have accessible names.
3. Extend action feedback with a destructive `AppButton` variant and `AppUndoNotice`.
   - **Files:** `src/components/ui/`, adapter tests.
   - **Depends on:** task 1.
   - **Verify:** Undo is discoverable and translated; no platform-specific control leaks into feature code.

## Phase 3 — Complete planned-item lifecycle

**Goal:** Finish Epic 4.4 in the create and detail screens.

1. Render persisted draft items through `GroceryItemRow` and invoke the prefilled item editor for edits.
   - **Files:** create/detail screen components, `planned-item-editor`, UI-flow tests.
   - **Depends on:** Phases 1–2.
   - **Verify:** edits preserve unit semantics; changing a unit clears quantity/price rather than converting values.
2. Soft-remove one planned item, persist it immediately, and show an immediate Undo notice.
   - **Files:** detail controller/use-case wiring, undo adapter, UI-flow tests, localization resources.
   - **Depends on:** task 1 and Phase 2 action feedback.
   - **Verify:** removed items disappear, Undo restores the exact item, and the durable Trash recovery path remains intact.
3. Finalize and reopen from list detail without changing the list currency or quantities.
   - **Files:** list-detail screen/controller, tests.
   - **Depends on:** tasks 1–2.
   - **Verify:** finalized lists reopen to editable planning state with currency locked after the first non-deleted item.

## Phase 4 — Verify and reconcile the epic

**Goal:** Demonstrate the complete Epic 4 contract before Epic 5 begins.

1. Add route-flow coverage for `Compra semanal`: `2 piece`, `500 g`, and `1.5 kg`; save, finalize, reopen, and assert exact persisted values.
   - **Files:** `src/tests/app/` plus focused domain/persistence coverage where needed.
   - **Depends on:** Phase 3.
2. Run validation and record the verified roadmap status.
   - **Commands:** `npm run test`, `npm run typecheck`, `npm run lint`, `npx expo-doctor@latest`.
   - **Manual review:** PT-BR/en; BRL/USD; VoiceOver/TalkBack labels; focus after add/edit/remove/Undo; dynamic type; contrast; reduced motion.
   - **Files:** `docs/v2/progress.md` only after all checks pass.

## Commit plan

1. `feat(epic4): split planning screens by route`
2. `feat(ui): add planning screen and form adapters`
3. `feat(epic4): add planned item lifecycle actions`
4. `test(epic4): cover reopen and undo planning flows`
5. `docs(v2): mark list planning validated`

Each commit remains independently testable and reviewable. The current route/editor commit is the foundation preceding this sequence.

## Exit criteria

- Users create, edit, soft-remove/Undo, finalize, reopen, and relaunch a list offline.
- Money and quantities remain safe integer domain values; locale parsing stays at UI boundaries.
- Home, create, and detail screens are no longer one monolithic module.
- Feature screens use only project adapters and semantic tokens.
- All automated checks and the bilingual accessibility review pass before Epic 5 starts.
