# UI tech debt backlog

Create tracker issues from these entries. Each issue should link to this file, the named V2 roadmap task, and the affected adapter or route.

## Priority order

| ID | Issue title | Type | Roadmap link | Scope and acceptance criteria |
|---|---|---|---|---|
| UI-TD-01 | Decompose the Home route into semantic screen components | Refactor | [Epic 2](../v2/roadmap/02-design-system-foundations.md), [Epic 4](../v2/roadmap/04-list-planning.md) | Replace the monolithic Home composition with route orchestration plus `ListCard`, `BudgetSummary`, empty-state, and sheet wiring components. No feature-level raw platform imports. |
| UI-TD-02 | Establish the page scaffold and navigation presentation boundary | Missing work | [Epic 2](../v2/roadmap/02-design-system-foundations.md) | Add `AppScreen` and document route-safe scroll, header/title, safe-area, and keyboard behavior for upcoming routes. |
| UI-TD-03 | Expand action, feedback, and destructive-action adapters | Missing work | [Epic 2](../v2/roadmap/02-design-system-foundations.md) | Add semantic destructive button support, native confirmation dialog, Undo notice, and accessible icon-action API. |
| UI-TD-04 | Add typed native settings-control adapters | Missing work | [Epic 2](../v2/roadmap/02-design-system-foundations.md), [Epic 6](../v2/roadmap/06-trash-and-recurrence.md) | Add `AppSwitch` and, where justified, platform-isolated segmented/picker adapters. Verify System/Light/Dark, language, and default-currency use cases. |
| UI-TD-05 | Standardize form-sheet behavior for item editing | Missing work | [Epic 4](../v2/roadmap/04-list-planning.md), [Epic 5](../v2/roadmap/05-in-store-execution.md) | Add `AppFormSheet` conventions for scroll, keyboard, save/cancel, validation, focus restoration, and reduced motion. |
| UI-TD-06 | Create reusable budget and grocery-row display composites | Missing work | [Epic 4](../v2/roadmap/04-list-planning.md), [Epic 5](../v2/roadmap/05-in-store-execution.md) | Implement semantic `BudgetSummary`, `GroceryItemRow`, and `ListCard` APIs with explicit planned/actual language and non-color-only status. |
| UI-TD-07 | Isolate platform-native item interaction behavior | Missing work | [Epic 5](../v2/roadmap/05-in-store-execution.md), [Epic 6](../v2/roadmap/06-trash-and-recurrence.md) | Implement `AppItemActions` behind platform files. Keep edit/delete/restore discoverable without swipe-only reliance. |
| UI-TD-08 | Implement the Penpot-backed screen inventory in roadmap order | New screens | [Epics 4–6](../v2/roadmap.md) | Build the planned routes and states from the screen inventory, using adapters only. Treat Penpot as hierarchy/control guidance, not a pixel spec. |
| UI-TD-09 | Add cross-flow accessibility and bilingual UI validation | Validation | [Epic 7](../v2/roadmap/07-visual-polish-and-accessibility.md) | Add adapter/state tests and a documented manual audit for PT/EN, BRL/USD, dynamic type, focus, screen readers, touch targets, contrast, and reduced motion. |
| UI-TD-10 | Complete Layout → Theme → Animation approval record | Decision / validation | [Epic 7](../v2/roadmap/07-visual-polish-and-accessibility.md) | Obtain owner approval before visual finalization and record accepted platform exceptions. |

## Issue template

```md
## Context
UI tech debt: [link to the relevant section]
Roadmap: [link to epic/task]

## Problem
[What makes the current or planned UI inconsistent, inaccessible, or non-native]

## Proposed adapter or screen change
[Project-facing API and expected platform behavior]

## Acceptance criteria
- [ ] Feature code consumes only project adapters and semantic tokens.
- [ ] Required accessibility semantics and focus behavior are specified.
- [ ] Light, Dark, and System behavior is covered where relevant.
- [ ] PT-BR/en and BRL/USD expansion is considered where relevant.
- [ ] Tests and device validation match the affected roadmap task.

## References
- [component mapping](./component-mapping.md)
- [screen and flow inventory](./screen-and-flow-inventory.md)
- [native feel and accessibility](./native-feel-and-accessibility.md)
```
