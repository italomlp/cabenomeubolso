# Maestro smoke flows

These flows target the Expo development build with app ID
`com.italomlp.cabenomeubolso`.

## Prerequisites

- Build and install the development app on an iOS Simulator or Android Emulator.
- Have the Maestro CLI available (`maestro --help`).
- Start each flow from the app's normal launch screen. The first three flows
  clear app state so they are independent of one another.
- Run `maestro check-syntax <flow.yaml>` for each changed flow before
  executing it; `check-syntax` accepts one file at a time.

## Flows

- `home-empty.yaml` verifies the empty Home state and opens the create-list
  shell.
- `create-validation.yaml` verifies that a list cannot be saved or finalized
  without a planned item, even after its name and budget are entered.
- `planned-item-validation.yaml` opens the planned-item editor and verifies
  the required name, quantity, and price validation messages.
- `offline-journey.yaml` covers UI list creation, the deterministic development
  shopping fixture, finalize/summary, manual template generation, and
  offline relaunch persistence. It enables airplane mode, kills the app
  process, and launches with `clearState: false`; an `onFlowComplete` hook
  restores the runner to its normal online baseline. Its Trash assertion is
  intentionally limited to the reachable empty state: this build has no
  list-delete action or deleted-list seed, so list restore remains pending
  rather than being represented by a guessed selector.
- `shopping-seed-placeholder.yaml` is intentionally blocked. Before running
  it, a deterministic persisted shopping list with ID
  `maestro-shopping-seed` and at least one planned item must be seeded into
  the app. This repository currently provides no Maestro seed step, so the
  placeholder is expected to fail at its shopping assertion rather than claim
  a passing shopping smoke test.

The `artifacts/ui-audit/` directory is ignored and may be used for local
screenshots, videos, and other UI-audit output.
