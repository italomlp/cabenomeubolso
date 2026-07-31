# Cabe no Meu Bolso

Offline-first grocery-budget app. V2 plans are the product contract; implementation guidance below does not replace them.

## Commands

```sh
npm run start
npm run android
npm run ios
npm run lint
npm run test
npm run typecheck
npx expo-doctor@latest
```

## Non-negotiable rules

- Build a clean Expo V2 app; do not upgrade or migrate the legacy Realm app.
- Keep domain records in SQLite. Screens do not issue SQL; domain code does not import platform or persistence libraries.
- Store money as safe integer minor units and quantities as safe integer `quantity_milli`; never use float totals.
- Use transactional, ordered V2 migrations. Preserve V2 data and soft-deleted records.
- Build UI through project-owned semantic tokens and adapters. Add explicit accessibility semantics.
- Validate independently: automated tests, realistic migration fixtures, and review.
- Check [V2 decisions](docs/v2/decisions-and-open-questions.md) before implementing gated behavior.

## Load guidance by task

Load only what the task needs: read a project local page for broad rules, read a local skill playbook for a focused implementation task, and load an external skill only for its named framework or tool trigger. See the [loading index](docs/agent-guidance/skill-loading.md).

**Project local pages:** [architecture](docs/agent-guidance/architecture.md), [domain and persistence](docs/agent-guidance/domain-and-persistence.md), [UI and accessibility](docs/agent-guidance/ui-and-accessibility.md), [testing and validation](docs/agent-guidance/testing-and-validation.md).

**Local skill playbooks:** [SQLite persistence](docs/agent-guidance/skills/sqlite-persistence.md), [UI adapter boundary](docs/agent-guidance/skills/ui-adapter-boundary.md).

Start with the [V2 reading order](docs/v2/README.md).
