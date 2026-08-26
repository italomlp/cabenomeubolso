# V2 decisions and open questions

## Decisions made

| Decision | Rationale |
|---|---|
| New Expo SDK 57 / RN 0.86.0 / React 19.2.3 application | Safer than incrementally upgrading RN 0.61; Node 22.13.x+ and `expo-doctor` validation are required. |
| Expo Router | Default Expo route model; replaces legacy React Navigation setup. |
| SQLite is the local source of truth | Offline-first relational data and durable V2 migrations. |
| Plain parameterized SQL first | Lower complexity than adopting an ORM for the initial small schema. |
| Clean database | Legacy Realm migration is explicitly out of scope. |
| No Redux/Saga/Persist | Domain data belongs in SQLite; Zustand is limited to UI/preferences state. |
| Repository/use-case boundaries | Preserves a future remote-sync seam without selecting or building one. |
| Soft delete for seven days | Supports recovery while keeping normal views uncluttered. |
| Independent template occurrences | Reuse must not create surprising cross-list edits. |
| EAS Update replaces CodePush | Supported Expo delivery path, constrained by runtime compatibility. |
| Supported UI languages: `pt-BR` and `en` | Bilingual V2 scope is explicit and remains offline through bundled resources. |
| Language resolution | Persisted supported override → supported device language → `en` fallback makes behavior predictable. |
| Supported transaction currencies: `BRL` and `USD` | V2 has a bounded, explicit currency scope without conversion or multi-currency lists. |
| Currency stored on monetary domain records | ISO code plus integer minor units keeps money correct independently of UI locale. |
| Per-list currency locks after items or actual spending | Avoids silent value conversion and historical ambiguity; new/clone lists are the V2 path. |
| Empty lists cannot be saved or finalized | Keeps the persisted lifecycle anchored to at least one planned item. |
| Finalized lists can be reopened and edited | Preserves history while still allowing planning corrections without cloning. |
| Pre-item currency change window | Currency may change until the first non-deleted item exists and before actual spending occurs; then it locks. |
| V2 units and quantity precision | Store `unit_code` from `piece`, `pack`, `kg`, `g`, `l`, `ml`; whole positive quantities for `piece`/`pack`/`g`/`ml`, and up to three decimals for `kg`/`l`. This supports practical weight/volume entry without fractional grams or millilitres. |
| `quantity_milli` meaning | Integer thousandths of the selected unit, never money: `1.5 kg` → `1500`; monetary fields remain currency minor units. |
| Unit-price semantics | Planned/actual unit minor amounts are prices per selected unit; V2 does not convert units or prices. |
| Default language | System: saved supported override → supported OS language → English. |
| Default new-list currency | Explicit saved selection wins; otherwise first configured locale’s supported `currencyCode` → `BR`/`US` region mapping → BRL. No physical location, language-tag, or timezone inference. |
| UI foundation | Use `@expo/ui` universal components first behind project-owned semantic-token/adapters; isolate SwiftUI/Compose-only APIs by platform. |
| Advertising | Install AdMob behind `AdService`, entitlement, and a release flag defaulting off. Placements are Home after list content and finalized Summary only; consent precedes initialization; test ads are mandatory in development. |
| Initial store release | Android only; iOS remains a native target but is not submitted without an Apple Developer account. |

## Assumptions to validate

- One person uses one device; no sharing is implied.
- A purchased item’s actual cost is entered as a unit price, from which the total is calculated.
- Finalized lists are historical records and remain immutable by default.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Expo ecosystem changes before work begins | Revalidate SDK/RN compatibility and run `npx expo-doctor`. |
| Incorrect money or quantity math | separate integer minor-unit money and selected-unit `quantity_milli` fields; pure calculation tests and boundary cases. |
| Locale changes currency or corrupts input | separate language/currency fields; explicit locale-aware parsing; PT/EN × BRL/USD regression tests. |
| SQLite migration defect loses V2 data | ordered, transactional migrations tested from prior schemas. |
| Native ad dependency disrupts development | validate the installed SDK and consent flow in an Android development build; AdMob does not run in Expo Go. |
| “Recurring” implies automation | ship manual generation unless cadence/notification expectations are confirmed. |

## Deferred deliberately

Remote sync, API, accounts, authentication, collaboration, cloud backup, backend choice, conflict resolution, subscription purchase flows, analytics, barcode/receipt features, reliable background processing, other language variants/currencies, exchange rates, currency conversion, multi-currency lists, and remote translations. AdMob integration is planned but remains disabled until an intentional release decision.

## Owner questions by implementation gate

| Gate | Question | Why input is needed |
|---|---|---|
| 1. Store identity | Retain the existing Android app identity/listing, or create a new V2 listing? | Explicitly deferred; needed before Android release credentials/configuration are created. |
| 2. Product rules | **Confirmed:** empty lists cannot be saved or finalized; finalized lists can be reopened and edited. | Implemented in list lifecycle validation. |
| 3. Quantity and prices | **Confirmed:** use `piece`, `pack`, `kg`, `g`, `l`, `ml`; decimal `kg`/`l` up to three places only; whole `piece`/`pack`/`g`/`ml`; price is per selected unit and no conversion; uncomplete retains `actualUnitMinor` while clearing purchase state, so a later repurchase may reuse it. | Preserves the entered store price across purchase toggles without counting it in actual totals while unpurchased. |
| 4. Trash | **Confirmed:** manual permanent deletion is required; expired-record cleanup runs on app launch and when Trash opens. | Manual deletion is an explicit recovery action, and both approved foreground entry points keep retention maintenance reliable without background execution. |
| 5. Recurrence | Is manual “Generate now” sufficient for V2? If not, what cadences and missed-occurrence behavior are required? | Before template generation/scheduling work begins. |
| 6. Design approval | Approve the logo direction, color direction, typography, and Portuguese/English product terminology. | Before high-fidelity UI/design implementation. |
| 7. Monetization | **Confirmed:** installed AdMob is flag-disabled by default; Home-after-content and finalized-Summary banners only; no active-shopping, interstitial, or rewarded ads. | Before enabling ads for a release. |
| 8. Release policy | Which EAS Update channels and runtime-version policy should be used? | Before production delivery configuration. |
| 9. Internationalization defaults | **Confirmed:** System language resolution and locale/region/BRL fallback currency proposal; users may explicitly choose BRL/USD independently of language. | Implement in preferences/create-list behavior. |
| 10. Internationalization product behavior | What English store descriptor/market positioning should accompany the Portuguese product name? | Before store assets are finalized. |
