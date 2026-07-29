# V2 implementation roadmap

Tasks in each epic are 1–2 hours including verification. Estimates exclude owner wait time, device procurement, and store review.

## Critical path

`01 Expo foundation → {02 Design foundations + 03 Domain} → 04 Planning → 05 Shopping → 06 Trash/recurrence → 07 Visual polish/accessibility → 09 Release`

Epic 3 (domain and persistence) and Epic 2 can run in parallel after Epic 1. Feature UI starts only after Epic 2; Epic 8 starts its AdMob boundary after Epic 2 and adds placements after the Home and Summary flows. Android is the initial store release; iOS native validation remains in scope where available.

## Epics

1. [Expo stack foundation](./roadmap/01-expo-stack-foundation.md) — 14–18h
2. [Design-system foundations](./roadmap/02-design-system-foundations.md) — 4–6h
3. [Domain and persistence](./roadmap/03-domain-and-persistence.md) — 12–16h
4. [List planning](./roadmap/04-list-planning.md) — 14–18h
5. [In-store execution](./roadmap/05-in-store-execution.md) — 12–16h
6. [Trash and recurrence](./roadmap/06-trash-and-recurrence.md) — 10–14h
7. [Visual polish and accessibility](./roadmap/07-visual-polish-and-accessibility.md) — 6–8h
8. [Monetization and operations](./roadmap/08-monetization-and-operations.md) — 10–14h
9. [Release readiness](./roadmap/09-release-readiness.md) — 10–14h

**Total:** 92–124 engineering hours. Dependencies and validation are defined in each epic.

## Dependency map

| Epic | Requires | Unblocks |
|---|---|---|
| 01 | clean-slate decision | 02, 03, 08 |
| 02 | 01 | feature UI (04–06), 08 AdMob boundary |
| 03 | 01 | 04–06, 09 persistence validation |
| 04 | 02, 03 | 05, 07, 08 Home placement, 09 |
| 05 | 02, 03, 04 | 06, 07, 08 Summary placement, 09 |
| 06 | 02, 03, 05 | 07, 09 |
| 07 | 02, core flows (04–06) | 09 |
| 08 | 01, 02; Home and Summary for placements | 09 |
| 09 | 01–08, including 07 | Android release decision |
