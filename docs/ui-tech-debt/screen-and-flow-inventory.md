# Screen and flow inventory

Penpot contains paired iOS and Android guidance for seven core screens, three interaction/sheet families, and five empty-state families. The shared information architecture is intentional; platform presentation may differ behind adapters.

| Surface | Route or presentation | Primary purpose | Required UI patterns | Key interactions |
|---|---|---|---|---|
| Home | `/(tabs)/home` | Resume, review, or create lists | List cards, budget status, primary create action, active/finalized sections, empty and no-active states | Open list, resume shopping, create plan, access list actions; ad only after list content when enabled. |
| Create plan | `/list/new` | Create a budgeted list | Name, currency, budget fields; item list; add-item sheet; validation | Save draft/plan, add/edit/remove planned items, retain entered values on validation failure. |
| Plan/edit list | `/list/[id]` | Refine a realistic plan | Same composition as create plan, existing item rows, action menu | Edit list metadata, add/edit items in sheet, soft delete with Undo. |
| Active shop | `/list/[id]/shop` | Make immediate in-store changes | Sticky actual/remaining `BudgetSummary`, purchased/unpurchased sections, item rows, add/edit sheet | Toggle purchased, enter actual price, add/edit item, announce total/status change without interrupting input. |
| Summary | `/list/[id]/summary` | Understand outcome and reuse a completed list | Planned vs actual summary, bought/unbought sections, clone action | Review outcome, clone/start a new plan; inline ad only when enabled. |
| Templates | `/(tabs)/templates` | Generate recurring lists | Template rows, cadence/value, empty state, generate action | Generate an occurrence now; edit or remove only according to the domain lifecycle. |
| Trash | `/trash` | Recover deleted records safely | Trash rows, deletion/expiry metadata, restore and permanent-delete actions, empty state | Restore with focus moved to the restored result; confirm permanent deletion. |
| Settings | `/(tabs)/settings` | Manage UI preferences | Grouped settings rows, select controls, switches where immediate/reversible | Set System/Light/Dark, language, default currency, privacy/entitlement options when available. |
| Add item | Sheet | Create one planned or shopping item in context | `AppFormSheet`, item fields, unit selection, pricing labels, validation | Save returns focus to the invoking list/action and announces the updated total where relevant. |
| Edit item | Sheet | Change an existing item without leaving context | Same form as add, pre-filled, destructive option only if appropriate | Save/cancel; retain draft until explicitly dismissed or reset by documented behavior. |
| Item actions | Context presentation | Act on an item without making rows dense | `AppItemActions`, platform-native affordances | Edit, delete/restore where applicable; do not rely on swipe-only actions. |

## State requirements

| State | Expected behavior |
|---|---|
| Empty | State explains why content is absent and gives a clear recovery action. |
| Loading or repository error | Preserve already visible data when possible; provide retry without losing a form draft. |
| Validation error | Field-level, translated, and connected to the input. Move focus to the first actionable error after submit. |
| Within budget | Show semantic safe status with text and icon. |
| Over budget | Show semantic risk status with text and icon; never block purchase completion. |
| Soft delete | Persist the delete, provide Undo, then expose recovery in Trash. |
| Permanent delete | Require explicit native confirmation and explain irreversibility. |

## Flow contracts

1. **Create → plan → shop → summary:** List currency is visible before budget entry and remains consistent. Planned and actual values remain explicitly labeled.
2. **Add/edit item:** The editor is a bottom sheet. Unit changes alter price meaning; they never convert values. Quantity and money fields preserve raw text while focused.
3. **Shopping completion:** Item completion persists immediately, updates the sticky summary, and announces the resulting total/status non-interruptively.
4. **Delete and restore:** Deletes are soft by default and recoverable from an Undo notice or Trash. Restore returns meaningful focus; permanent deletion is confirmed.
5. **Settings:** Preferences apply through adapters and theme/i18n infrastructure without changing existing list currencies.
