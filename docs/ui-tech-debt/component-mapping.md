# Component mapping

Use this table to choose project adapters. `@expo/ui` is an implementation detail of the adapter layer, not a feature-screen import.

## Mapping rules

| Need | Project-facing adapter | Native implementation direction | Notes |
|---|---|---|---|
| Root native UI hosting | `AppHost` | Universal `Host` from `@expo/ui` | Every Expo UI tree remains within the host. |
| Page scaffold and scroll content | `AppScreen` (add) | Semantic scroll/page wrapper | Account for safe areas; screens use stack titles rather than duplicate page titles. |
| Primary, secondary, destructive, icon action | `AppButton` (extend) | Universal native `Button` where sufficient | Provide semantic variants; icon-only actions require labels and 44 pt targets. |
| List and settings row | `AppRow` (extend) | Native list/row composition | Support title, supporting text, value, leading/trailing content, press, disabled, destructive, and accessibility hints. |
| Single-line and numeric input | `AppTextField` (extend) | Universal native text field | Keep raw text while focused. Money and quantity parsing stay at the UI boundary. |
| Currency, unit, language, or theme choice | `AppSelect` (extend) | Native picker/menu presentation | Use a sheet or platform-isolated picker when the universal component cannot preserve platform conventions. |
| Boolean setting | `AppSwitch` (add) | Native `Switch` | Use only for immediate, reversible preference changes; persist after the interaction succeeds. |
| Small mutually exclusive choice | `AppSegmentedControl` (add if needed) | Platform-isolated native segmented control | Appropriate for compact, immediately visible choices—not long lists. |
| Add/edit item editor | `AppFormSheet` plus field adapters (add) | `AppSheet` with a scrollable form | Penpot explicitly maps add/edit item work to sheets. Provide save/cancel, validation, keyboard avoidance, and focus restoration. |
| Confirmation for permanent delete or irreversible change | `AppConfirmationDialog` (add) | Native alert/dialog | Never use a sheet as a disguised destructive confirmation. |
| Undoable mutation feedback | `AppSnackbar` or `AppUndoNotice` (add) | Platform-isolated transient feedback | Use after soft delete; expose Undo without blocking the next task. |
| Budget amount and status | `BudgetSummary` (add) | Domain-display composite built from adapters | Always pair semantic color with status text and icon; numeric values use tabular numerals where available. |
| Home/list summary card | `ListCard` (add) | Semantic pressable card/row composition | Show list name, currency-aware budget status, planned/actual progress, and next action. |
| Grocery item in plan/shop | `GroceryItemRow` (add) | Semantic row plus completion control | Separate planned from actual labels; support purchased and unpurchased state. |
| Empty state | `AppEmptyState` (add) | Semantic composition | Include meaning, primary recovery action, and optional secondary path. |
| Destructive/recovery row | `TrashItemRow` (add) | Semantic row plus menu/actions | Show deletion and expiry dates plus restore/permanent-delete options. |
| Context actions on an item | `AppItemActions` (add) | Isolated iOS/Android behavior | Platform may differ: context menu, swipe actions, overflow menu, or explicit row affordance. Do not encode platform branching in a screen. |
| Bottom sheet | `AppSheet` (extend) | Universal `BottomSheet`, platform-isolated when required | Use for add/edit and option selection; do not use for navigation-critical full workflows. |
| Ad placement | `AdSlot` | Existing eligibility-gated placeholder | Only after list content on Home and inline in finalized Summary; never plan or shop. |

## Styling contract

| Concern | Rule |
|---|---|
| Color | Consume semantic tokens such as `surface`, `surfaceRaised`, `onSurface`, `muted`, `border`, `focus`, `budgetSafe`, `budgetRisk`, and `budgetNeutral`. No screen-local palette. |
| Layout | Prefer native grouped rows, clear sections, and content-driven spacing. Use tokenized spacing, continuous rounded corners, and a 44×44 pt minimum target. |
| Typography | Use the token contract; preserve dynamic type and text expansion. Currency and totals should use stable/tabular numerals where available. |
| Feedback | Prefer restrained native feedback: completion, total update, sheet presentation, inline validation, and undo. Honor reduced motion. |
| Safe areas | Route content is scrollable and safe-area-aware; fixed summary/action areas must avoid the home indicator and keyboard. |
| Platform differences | Preserve shared semantics while allowing native presentation to differ. Isolate differences behind the adapter. |

## Explicit anti-patterns

- No raw SwiftUI, Compose, or `@expo/ui` imports in feature screens.
- No bespoke card, picker, dialog, or sheet pattern for one screen.
- No color-only budget or destructive state.
- No formatted money or quantity as domain input.
