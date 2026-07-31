# Domain and persistence guidance

Load for calculations, input parsing, SQLite schema/migrations, list lifecycle, trash, templates, or currency behavior.

## Preserve the invariants

- Persist `BRL`/`USD` with safe integer minor units. Format and parse only at the UI boundary.
- Persist catalog `unit_code` values and safe integer `quantity_milli`; `quantity_milli` is thousandths of the selected unit, not money.
- Calculate totals from non-deleted item records. Do not store derived totals as authoritative values.
- Keep list currency independent of UI language. Never convert units, prices, or currencies in V2.
- Reject values and calculations outside JavaScript's safe-integer range. Check operands and the multiplication result before rounding; use `bigint` or reject the operation rather than silently losing precision.

```ts
if (!Number.isSafeInteger(item.quantityMilli) ||
    !Number.isSafeInteger(item.actualUnitMinor)) {
  throw new RangeError('Amount is too large');
}
const product = item.quantityMilli * item.actualUnitMinor;
if (!Number.isSafeInteger(product)) throw new RangeError('Amount is too large');
const actualItemMinor = Math.round(product / 1000);
if (!Number.isSafeInteger(actualItemMinor)) throw new RangeError('Amount is too large');
```

## Write safely

- Parameterize SQL. Use a transaction for every multi-row mutation, including list-plus-items, currency locks, and purge cascades.
- Apply ordered migrations through `PRAGMA user_version`; test empty and representative prior databases.
- Soft-delete with `deleted_at`. Preserve item deletion state when a deleted parent list is restored.
- Serialize concurrent writes through repository transactions.

```ts
await database.withTransactionAsync(async () => {
  await lists.softDelete(listId, deletedAt);
  await items.hideForDeletedList(listId);
});
```

Check [V2 data and rules](../v2/data-and-rules.md) for formulas and lifecycle rules, and [open decisions](../v2/decisions-and-open-questions.md) before choosing unresolved behavior. Use [testing guidance](./testing-and-validation.md) for migration fixtures and boundary cases.
