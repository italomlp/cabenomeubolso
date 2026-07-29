# V2 product vision

## Product promise

**Cabe no Meu Bolso** helps a person turn a grocery budget into a live shopping list, record what they actually spend, and see whether the cart still fits the budget.

## Target user

A shopper who plans a supermarket trip with a fixed amount, often on a phone in-store, and needs fast entry, readable currency, and a reliable total without connectivity. V2 serves Portuguese (`pt-BR`) and English (`en`) UI users; it does not position the product as Brazil-only.

## Language and currency promise

- The default language is System: persisted supported user override, first supported device language (`pt-*` maps to `pt-BR`, `en-*` maps to `en`), then `en`.
- V2 supports exactly `BRL` and `USD`. An explicit saved selection proposes a currency for a new list; otherwise use configured locale `currencyCode`, then `BR`/`US` region mapping, then BRL. Every list keeps its own explicit ISO code.
- Language and transaction currency are independent. Device region, locale, and UI language never determine an existing list’s currency.

## Quantity and unit promise

- Every item has one selected unit: `piece`, `pack`, `kg`, `g`, `l`, or `ml`. The app stores that language-neutral code and translates its label for the UI.
- `piece`, `pack`, `g`, and `ml` accept positive whole quantities. `kg` and `l` accept positive quantities with up to three decimal places.
- A unit price means the price **per selected unit**. V2 does not convert units: a price entered per `kg` is not reused as a price per `g`.

## Outcomes

- Create a named list with a total budget and planned items.
- During shopping, adjust quantities and planned amounts, add forgotten items, mark items bought or not bought, and record actual prices.
- See planned, actual, remaining, and over-budget status immediately.
- Reuse a list as a recurrence template without linking later occurrences to it.
- Recover recently removed lists and items for seven days.

### Example

`Compra semanal` has a `BRL 400.00` budget. Milk is planned as `2 piece × BRL 6.00/piece`. At the store it costs `BRL 6.50/piece`: record `2 piece × BRL 6.50/piece`; the actual total rises by `BRL 13.00` and the remaining amount updates. Tomatoes can be `1.5 kg × BRL 2.00/kg`, totaling `BRL 3.00`. In an English UI, a separate `Weekly groceries` list may instead use a `USD 100.00` budget.

## V2 workflow

1. **Home:** create, resume, review finalized lists, or open Trash/Templates.
2. **Plan:** name the list, set its budget, and add planned items.
3. **Shop:** edit any item or list budget; add items; mark an item bought with actual price, or leave it unbought.
4. **Finish:** finalize with a summary, including unbought items when applicable.
5. **Reuse:** turn a suitable list into a template; generate an independent occurrence later.

## Non-goals

- Accounts, authentication, cloud backup, API, remote synchronization, collaboration, or conflict resolution.
- Legacy Realm-data migration; V2 starts with an empty local database.
- Subscription checkout, purchase validation, or analytics. AdMob is installed behind a disabled release flag; it is not a claim that advertisements are live.
- Price scraping, store inventory, barcode scanning, or automatic receipt parsing.
- Custom units, unit conversion, weight-price conversion, and fractional `g` or `ml` quantities.

## Naming and relaunch

Keep **Cabe no Meu Bolso** as the customer-facing name: it carries the existing promise and is memorable in Portuguese. Use **Cabe** only as a friendly in-product shorthand after first context; use “shopping list” in English planning/developer copy to avoid domain ambiguity. The final market positioning and English store descriptor remain owner decisions.

**Suggested descriptor:** “Sua lista de compras dentro do orçamento.”

Before store relaunch, confirm the app-store title, subtitle, package identifiers, screenshots, and whether the old listing is retained or replaced. This decision is needed before release configuration, not before product development.
