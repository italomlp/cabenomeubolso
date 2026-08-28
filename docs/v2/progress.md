# V2 implementation progress

This file is the persistent status record for V2 work across sessions. The roadmap remains the implementation contract; update this file only after an epic PR is validated and merged into `v2-agentic-implementation`.

**PR scope:** this update records the merged state at commit 200efac. Epics 1–3, #45, and #46 landed in `v2`. Epics 4–9 (via #47–#53) merged into `v2-agentic-implementation`.

## Current status

| Epic | Status | Branch / PR | Validation |
|---|---|---|---|
| 01 Expo stack foundation | Complete | `epic/01-expo-stack-foundation` / #40 | Expo Doctor, lint, typecheck, 12 Jest tests |
| 02 Design-system foundations | Complete | `epic/02-design-system-foundations` / #42 | 14 Jest suites, lint, typecheck, review |
| 03 Domain and persistence | Complete | `epic/03-domain-and-persistence` / #43 | 32 Jest tests, lint, typecheck, review |
| 04 List planning | Complete | `epic/04-list-planning` / #45, #47, #48 | Tests, lint, typecheck, device smoke, review |
| 05 In-store execution | Complete | `epic/05-in-store-execution` / #50 | Shopping/Summary/clone integration tests, review |
| 06 Trash and recurrence | Complete | `epic/06-trash-and-recurrence` / #51 | Trash/template integration tests, review |
| 07 Visual polish and accessibility | Complete | `epic/07-visual-polish-accessibility` / #52 | Maestro smoke flows, native UI audit, accessibility review |
| 08 Monetization and operations | Foundation complete | `epic/08-monetization-operations` / #46, #49 | 8.1–8.3 merged; runtime placement/configuration/lifecycle deferred until Gate 7 owner-approved release decision |
| 09 Release readiness | Scaffolding merged | `epic/09-release-readiness` / #53 | 9.1/9.3/9.4 pending; 9.5 owner-gated |

## Completed work

### Epic 1 — Expo stack foundation

- Merged into `v2` on 2026-07-31.
- Replaced the legacy React Native root with native-only Expo SDK 57.
- Added Expo Router, versioned SQLite WAL bootstrap, persisted preferences, `pt-BR`/`en` localization, BRL/USD default resolution, and development-build configuration.
- Follow-up commits included transactional migrations and localized shell copy.

### Epic 2 — Design-system foundations

- Merged into `v2` on 2026-07-31 via #42.
- Added semantic Light/Dark/System theme resolution, a project-owned `@expo/ui` adapter boundary, and isolated ad-slot platform adapters.
- Added adapter, accessibility-semantics, and theme smoke coverage; centralized the `@expo/ui` Jest mock helper.

### Epic 3 — Domain and persistence

- Merged into `v2` on 2026-07-31 via #43.
- Added integer-safe money/unit domain rules, ordered SQLite migrations, repositories, and transactional use cases.
- Added real upgrade-fixture, atomic-write, soft-delete-preservation, and currency-lock coverage.

### Epic 4 — List planning

- #45 merged into `v2`; #47, #48 merged into `v2-agentic-implementation`.
- Added Home, create/edit list, planned items, locale-aware parsing, and planning summaries.

### Epic 5 — In-store execution

- Merged into `v2-agentic-implementation` via #50.
- Added shopping session, actual pricing, finalize, Summary, and clone flows.

### Epic 6 — Trash and recurrence

- Merged into `v2-agentic-implementation` via #51.
- Added soft-delete, restore/purge, Trash, templates, and manual Generate now.

### Epic 7 — Visual polish and accessibility

- Merged into `v2-agentic-implementation` via #52.
- Applied shared adapters and refined states across flows; completed native UI audit and accessibility review artifact.

### Epic 8 — Monetization and operations

- #46 merged into `v2`; #49 merged into `v2-agentic-implementation`.
- Added AdMob SDK, `AdService`/entitlement/flags, consent/ATT/test-ad safeguards, and release/OTA procedure (8.5) documented; EAS policy and store credentials deferred and owner-gated.
- **8.4 banner placements remain deferred** — runtime placement/configuration/lifecycle awaits a Gate 7 owner-approved release decision; AdMob remains installed and default-disabled.

### Epic 9 — Release readiness

- Scaffolding merged into `v2-agentic-implementation` via #53.
- Added CI, Node pinning, release docs, and SDK patch alignment; 9.1/9.3/9.4 pending; 9.5 owner-gated.

## Next work

Start the next eligible branches from the latest `v2-agentic-implementation`:

- Keep Epic 8.4 runtime placement/configuration/lifecycle deferred until the Gate 7 owner-approved release decision
- Complete Epic 9.1 offline E2E, 9.3 matrix/accessibility regression, and 9.4 Android build smoke; 9.5 remains owner-gated

Read the relevant roadmap files, the architecture, and decision log before implementation.

## Update procedure

1. Create one branch per epic from current `v2-agentic-implementation`; open its PR back to `v2-agentic-implementation`.
2. Keep task-level commits aligned with the epic roadmap.
3. Run the epic's stated validation and record its outcome in the PR.
4. After merge, update this table, add a short completed-work note, and identify newly unblocked epics.
5. Open a documentation-only PR to `v2-agentic-implementation` for the tracker update; do not edit this file directly on an epic branch.
6. If an epic is blocked, record the decision needed and link `decisions-and-open-questions.md`.
