# Cabe no Meu Bolso V2 plan

V2 revives **Cabe no Meu Bolso** as an offline-first grocery-budget app. It starts with a clean Expo application and a clean local database; it does not migrate Realm data or implement accounts, a backend, remote sync, purchases, analytics, or live ads. V2 ships Portuguese (`pt-BR`) and English (`en`) UI, with BRL and USD as its only supported transaction currencies.

## Reading order

1. [Implementation handoff](./implementation-handoff.md) — clean-slate boundary, retained behavior, release ownership, and starting order.
2. [Product vision](./product-vision.md) — problem, user, scope, and relaunch name.
3. [UX and design](./ux-design.md) — screens, navigation, accessibility, and brand brief.
4. [Data and rules](./data-and-rules.md) — source-of-truth money/quantity calculations, unit rules, and lifecycle rules.
5. [Architecture](./architecture.md) — SDK 57 baseline, local-first boundaries, and operations.
6. [Dependencies](./dependencies.md) — install policy, verified versions, boundaries, and build requirements.
7. [Design system](./design-system.md) — tokens, adapters, `@expo/ui`, and accessibility.
8. [Decisions and open questions](./decisions-and-open-questions.md) — confirmed direction and owner inputs.
9. [Roadmap](./roadmap.md) — critical path and detailed epics.
10. [Development builds](./development-builds.md) — Expo Go vs development/release build boundaries.

## Scope guardrails

- Preserve the promise: plan a grocery list and stay within its total budget while shopping.
- Keep all V2 domain data on-device in SQLite.
- Keep UI language and list currency independent: a Portuguese UI can show USD and an English UI can show BRL.
- Support only `pt-BR`/`en` and `BRL`/`USD`; no currency conversion, multi-currency lists, remote translations, or backend support is in scope.
- Support only the closed V2 unit catalog: `piece`, `pack`, `kg`, `g`, `l`, and `ml`. Units are stored as language-neutral codes and translated in the UI; custom units and unit conversion are out of scope.
- Keep money and quantity distinct: monetary values are currency minor units, while `quantity_milli` is thousandths of the selected unit.
- Design repository seams for a future sync adapter, without choosing or building a backend.
- Build the clean-slate app on Expo SDK 57 (React Native 0.86.0, React 19.2.3, Node 22.13.x+); see the [dependency catalog](./dependencies.md).
- Use `npx expo install` for Expo-managed dependencies and lock its resolved versions during implementation.
- Android is the initial store release. iOS remains a native target but has no initial store release because no Apple Developer account is available.

> **Planning status:** recommendations are not implementation claims. Owner questions block the stated roadmap task, not earlier work.
