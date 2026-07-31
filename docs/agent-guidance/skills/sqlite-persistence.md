# SQLite persistence playbook

Load when changing SQLite schema, migrations, repository mapping, or a multi-row persistence write.

## Do

- Keep screens out of SQL and map rows to domain models at the adapter boundary.
- Store money and `quantity_milli` as safe integers. Reject unsafe operands or products before rounding; do not silently lose precision.
- Apply ordered, transactional migrations through `PRAGMA user_version`.
- Wrap every multi-row mutation, purge cascade, and currency-lock transition in one repository transaction.
- Soft-delete with `deleted_at`; restoring a parent must preserve an item deleted before its parent.
- Test empty and representative prior-schema database fixtures, including an injected write failure.

```ts
await database.withTransactionAsync(async () => {
  await lists.setCurrency(listId, currencyCode);
  await lists.lockCurrencyIfItemsExist(listId);
});
```

## Don't

- Do not issue SQL from screens or import SQLite into domain rules.
- Do not use floating-point money or quantities, persist derived totals, or mix list currencies.
- Do not change a list currency after non-deleted items or actual spending exist.
- Do not make migrations non-transactional, skip prior fixtures, or hard-delete before expiry.

## Validation checklist

- [ ] Domain and repository tests cover safe-integer limits, rounding, and invalid input.
- [ ] Fresh and each supported prior-schema fixture migrate successfully with records, currency, units, quantities, and soft deletes preserved.
- [ ] An injected write failure leaves no partial rows.
- [ ] Concurrent writes serialize, and currency locks remain correct.
- [ ] Normal reads and totals exclude deleted records.

Sources: [V2 data and rules](../../v2/data-and-rules.md), [Epic 3](../../v2/roadmap/03-domain-and-persistence.md), and [domain guidance](../domain-and-persistence.md).
