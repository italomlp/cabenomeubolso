# V2 implementation handoff

## Start here

V2 replaces the repository root with a new Expo application. Preserve the legacy React Native app only in Git history; do not upgrade it in place or migrate its Realm data. V2 starts with an empty SQLite database, while its own later schema migrations must preserve V2 records.

## Preserve the product, not the stack

| Retain for users | Do not carry forward |
|---|---|
| Budgeted shopping lists; planned and actual quantities/prices; active shopping; finalized summaries; list cloning | Legacy native app/tooling, Redux/Saga/Persist, Realm, CodePush, and data migration |

The source of truth for scope and rules is [product vision](./product-vision.md) and [data and rules](./data-and-rules.md).

## Implementation order

1. Start [Epic 1: Expo stack foundation](./roadmap/01-expo-stack-foundation.md), then verify the clean app, empty versioned SQLite database, localization, and development build.
2. Run [Epic 2](./roadmap/02-design-system-foundations.md) and [Epic 3](./roadmap/03-domain-and-persistence.md) in parallel after Epic 1.
3. Use [architecture](./architecture.md), [dependencies](./dependencies.md), [design system](./design-system.md), and [data and rules](./data-and-rules.md) as implementation contracts before feature work.
4. Follow the remaining dependency order in the [roadmap](./roadmap.md). Resolve a gate only when its epic requires it.
5. Check [decisions and open questions](./decisions-and-open-questions.md) before implementing gated behavior; it is the authoritative decision log.

## Release ownership checklist

Before a production release, assign an owner and record completion for:

- [ ] App identity, package IDs, store listing, signing credentials, and Android release process.
- [ ] iOS native validation scope; iOS store submission remains out of scope without an Apple Developer account.
- [ ] Privacy policy, store data-safety disclosures, AdMob consent/ATT/privacy-options review, and ad enablement.
- [ ] EAS Update channels and `runtimeVersion` policy; rebuild for native dependency or config-plugin changes.
- [ ] CI quality gates, beta distribution, supported-device matrix, rollback procedure, and support owner.

## Decision status

**Confirmed:** root replacement, clean database, Android-first release, offline SQLite, and disabled-by-default AdMob boundaries.

**Open:** store identity, lifecycle edge cases, recurrence/trash behavior, final design, EAS policy, and remaining internationalization product choices. See the [decision log](./decisions-and-open-questions.md) for gates and owners; do not duplicate or silently resolve them here.
