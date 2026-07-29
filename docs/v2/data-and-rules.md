# V2 data and rules

## Conceptual schema

## New-list currency proposal

Never request physical location for currency. If there is no persisted explicit default, inspect the first `expo-localization` configured locale: supported `currencyCode` (`BRL`/`USD`) → `regionCode` (`BR` → BRL; `US` → USD) → BRL. Do not use timezone or language tags. A user selection persists and is never automatically replaced.

| Entity | Key fields |
|---|---|
| `shopping_lists` | `id`, `name`, `currency_code` (`BRL` or `USD`), `budget_minor`, `status` (`draft`, `active`, `finalized`), `finalized_at`, `deleted_at`, timestamps |
| `shopping_list_items` | `id`, `list_id`, `name`, `unit_code`, `quantity_milli`, `planned_unit_minor`, `actual_unit_minor?`, `purchased_at?`, `sort_order`, `deleted_at`, timestamps |
| `recurrence_templates` | `id`, `source_list_id?`, `name`, `currency_code` (`BRL` or `USD`), `budget_minor`, `cadence`, `next_occurrence_on?`, `active`, timestamps |
| `template_items` | independent item snapshot, including `unit_code`, `quantity_milli`, and planned unit amount in minor units, used to generate occurrences |

Store money as integer minor units with an ISO currency code (`BRL` or `USD`) and quantity as integer thousandths of its selected unit (`quantity_milli`): never use binary floating point. Both initial currencies have two minor digits. `quantity_milli` is **not money**: `1.5 kg` is `1500`, `500 g` is `500000`, and `2 piece` is `2000`. Every monetary aggregate carries its source list/template currency; no list, aggregate, or template mixes currencies.

### Units and prices

`unit_code` is one of `piece`, `pack`, `kg`, `g`, `l`, or `ml`; it is a language-neutral persistence value. UI labels are translated. V2 has no custom units or conversions.

| Unit codes | Accepted quantity | Stored invariant |
|---|---|---|
| `piece`, `pack`, `g`, `ml` | positive whole number | positive `quantity_milli` divisible by `1000` |
| `kg`, `l` | positive value with up to 3 decimal places | positive integer `quantity_milli` |

`planned_unit_minor` and `actual_unit_minor` are monetary minor-unit prices **per selected unit**, not per base weight or volume. Changing `kg` to `g` changes the pricing meaning and requires explicit new values; V2 performs no conversion.

## Calculations

For each non-deleted item:

```text
plannedItemMinor = round(quantityMilli × plannedUnitMinor / 1000)
actualItemMinor  = purchased ? round(quantityMilli × actualUnitMinor / 1000) : 0
plannedTotal     = Σ plannedItemMinor
actualTotal      = Σ actualItemMinor
remainingMinor   = budgetMinor − actualTotal
varianceMinor    = actualTotal − plannedTotal
```

`actualUnitMinor` is required when an item becomes purchased. A zero price is valid only after the user explicitly confirms it (for a free item); blank is not zero. Recalculate totals from item records on every read/write; do not persist derived totals as authoritative values.

### Examples

| Item | Quantity | Planned | Actual | Purchased | Actual total |
|---|---:|---:|---:|---|---:|
| Milk | 2 | BRL 6.00 | BRL 6.50 | yes | BRL 13.00 |
| Rice | 1 | BRL 25.00 | — | no | BRL 0.00 |

With a BRL 40.00 budget, actual remaining is BRL 27.00. The BRL 25.00 planned Rice amount does **not** reduce actual remaining until it is purchased. The identical calculation works for a USD list without conversion.

For a weight-priced item, `1.5 kg` has `quantity_milli = 1500`; BRL 2.00/kg has `actual_unit_minor = 200`. Its actual total is `round(1500 × 200 / 1000) = 300` minor units, or BRL 3.00. `500 g` instead has `quantity_milli = 500000` and must have a price explicitly entered per `g`.

## List lifecycle

- A draft/active list may change name, budget, items, quantities, planned prices, actual prices, and purchase state. Changing an item unit requires explicit per-unit price values; it never converts existing values.
- Toggling purchased **on** requires/retains an actual unit price and sets `purchased_at`.
- Toggling purchased **off** clears `purchased_at` and excludes the actual amount. Retaining or clearing the entered actual price is an owner decision; default proposal: retain it for quick re-completion, but never count it.
- Finalizing is allowed with unpurchased items after confirmation. A finalized list is read-only until the owner-approved “reopen” policy exists; V2’s default is no reopen.
- A budget may be exceeded; show the overage, never prevent saving/finalizing.
- A list currency is selected when the list is created and is copied into templates and generated/cloned lists. It is never inferred from language, locale, or region.
- Currency is immutable after a list has any non-deleted item or actual spending. Start or clone a new list to use the other currency; no conversion rule exists in V2. Whether an empty list may change currency is an owner decision.

## Trash

Deleting a list or item sets `deleted_at`; it does not erase the row. Deleted records are excluded from normal totals and views. Trash shows an expiry of `deleted_at + 7 days`.

- Restore before expiry clears `deleted_at` and returns the record to its original list/status.
- Purge only records at or after expiry, including a list’s items in the same transaction.
- Deleting a list hides all of its items through the parent; restoring restores the list and its non-individually-deleted items.
- An item deleted before its parent list remains deleted when the parent is restored.
- Permanent delete is destructive and needs confirmation.

The cleanup trigger (app launch, opening Trash, and/or scheduled best effort) is an owner question; expiry behavior must not depend on background execution.

## Recurrence

A template stores its own name, cadence, and item/budget snapshot. Generating an occurrence copies the snapshot to a **new independent list** with new IDs, no actual prices, no purchase state, and no link that propagates later edits.

Template changes affect only future generated occurrences. Editing or deleting an occurrence never changes a template. Automatic generation and notifications are deferred; V2 can support manual “Generate now” unless the owner selects a cadence behavior before recurrence work begins.

## Validation and edge cases

- Name: trim whitespace; require a non-empty value.
- Unit: require one catalog code: `piece`, `pack`, `kg`, `g`, `l`, or `ml`; never persist a translated label or custom unit.
- Quantity: retain raw text during editing; parse only on commit/blur using the explicit input locale. Allow intermediate editing states, then reject ambiguous formatting, overflow, zero/negative values, and invalid precision. Require whole quantities for `piece`, `pack`, `g`, and `ml`; allow at most three decimals for `kg` and `l`. Persist only validated integer `quantity_milli`.
- Unit price: `planned_unit_minor`/`actual_unit_minor` is a non-negative price per selected unit. A unit change requires explicit price semantics; no unit or weight-price conversion exists.
- Budget and prices: parse at the UI boundary using the explicit input locale, require non-negative integer minor units, and reject malformed input. Persist canonical minor units and ISO codes, never formatted strings.
- Empty lists may be saved only if the owner approves; otherwise require one non-deleted item before activation/finalization.
- A deleted item cannot be edited or purchased until restored.
- Concurrent writes on one device are serialized through repository transactions; every mutation refreshes computed summary data.
