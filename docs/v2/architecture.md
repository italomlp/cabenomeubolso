# V2 architecture

## Target baseline

Create a new Expo SDK 57 project: React Native 0.86.0, React 19.2.3, and Node 22.13.x or later. Run `npx expo-doctor@latest` before accepting the installation. Use Expo Router and the catalog in [V2 dependencies](./dependencies.md); Expo-managed packages are resolved with `npx expo install` and locked during implementation.

| Concern | Direction | Why |
|---|---|---|
| Navigation | Expo Router | filesystem routes and supported Expo starter path |
| Domain storage | `expo-sqlite` | persistent relational local source of truth |
| SQL | parameterized, hand-written SQL first | small schema; avoid ORM migration overhead until justified |
| State | Zustand for preferences/transient UI only | prevents a second domain-record store |
| Localization | `expo-localization` + bundled `react-i18next` resources | deterministic offline `pt-BR`/`en` UI without translation network dependency |
| Updates | EAS Update | successor to CodePush-style JS/assets updates |
| UI | `@expo/ui` behind project adapters and semantic tokens | Epic 2 establishes the shared UI boundary before feature screens; platform-specific APIs remain isolated |
| Ads | installed AdMob SDK behind `AdService`, entitlement, and flags | enables safe, disabled-by-default release control |

## Clean-slate modernization

Do not upgrade the React Native 0.61 application in place. Scaffold a separate Expo application, rebuild V2 behavior against the rules in this plan, and launch with a clean SQLite database. Redux, Saga, Redux Persist, Realm, and CodePush do not move forward.

## Local-first boundary

```text
Expo Router screen
  → feature controller / Zustand UI state
  → use case (pure rules + explicit dependencies)
  → repository interface
  → SQLite repository and migrations
```

Domain types, calculation functions, use cases, and repository interfaces must not import Expo, SQLite, Zustand, Drizzle, Supabase, or Firebase. Screens invoke use cases; they do not issue SQL. Repositories return domain models, not database rows.

Example ports:

```ts
interface ShoppingListRepository {
  get(id: string): Promise<ShoppingList | null>;
  list(filter: ListFilter): Promise<ShoppingList[]>;
  save(list: ShoppingList): Promise<void>;
  softDelete(id: string, at: Date): Promise<void>;
}
```

Use an explicit unit-of-work/transaction boundary for multi-row writes (for example, creating a list plus its items). Parameterize all SQL. Enable WAL, apply ordered versioned migrations using `PRAGMA user_version`, and use exclusive transactions for isolated multi-step writes where supported. Treat web SQLite as a separate, alpha-supported target; validate it before promising web parity.

## Future-sync seam (not implementation)

Later sync can add a remote adapter and a sync/outbox port at the composition root. It must not change calculations or local repository contracts. This plan intentionally omits provider selection, credentials, authentication, conflict policy, transport, and background sync.

## State strategy

- **SQLite:** lists, items, templates, occurrence metadata, trash metadata, and migrations.
- **Zustand:** versioned theme, language override, explicit default-currency preference, open-sheet/filter state, and other small UI state. Persist only preference-like values; handle hydration before rendering state-dependent UI.
- **Component state:** focused input text and short-lived form interaction.

## Localization and money boundary

- Use `expo-localization` to read configured device locales, never physical location. Resolve language deterministically: persisted supported override → first supported device language (`pt-*` → `pt-BR`, `en-*` → `en`) → `en`. Never persist a raw detected locale as an override.
- Configure native per-app supported locales for `pt-BR` and `en` through `expo-localization` when implementation packages are finalized. This config-plugin change requires a new native build.
- Bundle `pt-BR` and `en` translation resources with the app. Use `react-i18next` with `fallbackLng: 'en'`, stable semantic keys, and initialization before localized UI renders. Do not add remote translation loading.
- Store a versioned preference payload containing the language override (or System) and explicit default currency. If no explicit currency exists, derive a new-list proposal from the first configured locale: supported `currencyCode` (`BRL`/`USD`) → `regionCode` (`BR` → BRL; `US` → USD) → BRL. Do not use language tags, timezone, or physical location. An explicit selection wins and is never overwritten automatically; re-evaluate only automatic choices when Android returns to foreground.
- Domain records carry ISO currency codes independently of preferences: lists, monetary aggregates, templates, and template snapshots use `BRL` or `USD` plus integer minor-unit amounts. A repository must not infer currency from UI language, device region, or locale.
- At the UI boundary, format with `Intl.NumberFormat(locale, { style: 'currency', currency })`. Parse input with the explicit input locale’s `formatToParts()` separators, validate it, and convert to minor units before a use case. `Intl` formats but does not parse; never persist formatted strings or use float totals.

## Quantity and unit boundary

- An item stores a language-neutral `unit_code` from the closed catalog `piece`, `pack`, `kg`, `g`, `l`, `ml`, plus integer `quantity_milli`. `quantity_milli` is thousandths of that selected unit, not a monetary minor-unit field: `1.5 kg` → `1500`, `500 g` → `500000`, `2 piece` → `2000`.
- Keep raw quantity text in component state until commit/blur. The UI parses with explicit locale separators and sends validated integer `quantity_milli` plus `unit_code` to a use case; the domain and repository never parse formatted text or use floats.
- Domain validation permits a positive multiple of `1000` for `piece`, `pack`, `g`, and `ml`; it permits any positive integer `quantity_milli` for `kg` and `l`. Reject precision/format ambiguity and values outside the chosen integer range before persistence.
- `planned_unit_minor` and `actual_unit_minor` mean minor-unit price per selected `unit_code`. Calculate with integer arithmetic and the `1000` scale; changing units never converts quantity or price in V2.

## Monetization foundation

Install `react-native-google-mobile-ads` now, but expose it only through `AdService`, entitlement, and a release feature flag that defaults **off**. The only V2 placements are an adaptive banner on Home after list content and an inline banner in a finalized Summary. Never render ads in the active shopping flow; no interstitial or rewarded ads are in V2. Do not add purchases or analytics.

AdMob requires its config plugin, platform App IDs, consent before initialization, test IDs/non-production configuration in development, and an Expo development or release build—not Expo Go. Native dependency or plugin changes require a rebuild. Epic 2 supplies the `AdSlot` adapter boundary; Epic 8 adds placements only after Home and Summary exist. See [dependencies](./dependencies.md) and [roadmap Epic 8](./roadmap/08-monetization-and-operations.md).

## Operational constraints

- EAS Update releases only JS/assets to compatible native builds. Set and enforce a `runtimeVersion` policy; native dependency or config-plugin changes require a new build.
- Local reminders are optional future work. Notifications/background execution are not a dependable sync mechanism.
- Test migrations from an empty database and representative prior schemas. Data loss from the legacy Realm app is accepted, but V2 migrations must preserve V2 data across upgrades.
