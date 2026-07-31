# Skill-loading index

V2 documents are the product contract. Project local guidance interprets that contract for this repository. External skills add framework or tool expertise; neither overrides V2 or local guidance.

## Load by trigger

| When the task involves | Read this project local page | Then read this local skill playbook | Load an external skill only when relevant |
|---|---|---|---|
| Routes, app layers, state, native dependencies, updates | [Architecture](./architecture.md) | — | `expo-router`, `eas-update-insights`, or `eas-app-stores` for the named platform/release task |
| Rules, money, quantities, SQLite, migrations, trash, templates | [Domain and persistence](./domain-and-persistence.md) | [SQLite persistence](./skills/sqlite-persistence.md) for schema, migration, or repository writes | `expo-data-fetching` only for network work; V2 has no backend/sync scope |
| Screens, adapters, themes, forms, accessibility, motion | [UI and accessibility](./ui-and-accessibility.md) | [UI adapter boundary](./skills/ui-adapter-boundary.md) when adding or changing a control or platform exception | `expo-ui`, `expo-native-ui`, `animations`, or `gestures` for that specific UI technology |
| Tests, fixtures, device/release checks, review | [Testing and validation](./testing-and-validation.md) | Relevant playbook only when validating its change | `qa-test-planner`, `agent-browser`, or `eas-simulator` for the requested validation method |
| Writing or changing project guidance | This index and the affected page or playbook | — | `writing-clearly-and-concisely` or `agent-md-refactor` |

Do not preload every page, playbook, or external skill. A local page gives broad project rules; a local skill playbook gives a repeatable task checklist; an external skill covers a named technology or tool.

## Local-document convention

- Put durable project-specific rules in `docs/agent-guidance/<topic>.md`, not in the root file.
- Give each page a one-line load trigger, short imperative rules, one working example where useful, and source links to `docs/v2/`.
- Add one row here when a new page has a distinct task trigger. Keep `AGENTS.md` limited to universal rules and links.
- Put focused, repeatable project workflows in `docs/agent-guidance/skills/<task>.md`. Each playbook needs a load trigger, Do / Don't rules, validation checklist, and V2 source links.
- Link local pages with relative paths. Do not copy the V2 product contract; point to its authoritative section.

Before implementing gated behavior, read [V2 decisions](../v2/decisions-and-open-questions.md).
