# UI tech debt

This directory turns the Penpot wireframes into durable implementation guidance for Cabe no Meu Bolso V2. The wireframes guide information hierarchy and the choice of native controls; they are not pixel-perfect specifications.

## Purpose

- Repair the current UI surface without bypassing the project adapter boundary.
- Define the abstractions needed by Planning, Shopping, Trash, Templates, Summary, and Settings.
- Make future UI work consistent with the V2 product contract and native platform conventions.

## Sources of truth

1. [V2 UX and design](../v2/ux-design.md)
2. [V2 design system](../v2/design-system.md)
3. [V2 roadmap](../v2/roadmap.md)
4. The currently open Penpot page, used as design guidance.

When sources disagree, the V2 documents win. Record a decision before changing a gated behavior in [V2 decisions](../v2/decisions-and-open-questions.md).

## How to use this documentation

1. Start with [component mapping](./component-mapping.md) before introducing or changing a control.
2. Use [screen and flow inventory](./screen-and-flow-inventory.md) to identify the route, state, and interaction contract.
3. Create implementation issues from [backlog](./backlog.md), linking both the relevant roadmap task and this guidance.
4. Validate using [native feel and accessibility](./native-feel-and-accessibility.md).

## Non-negotiable boundary

Features consume project-owned semantic adapters and tokens. Adapters may use universal `@expo/ui` inside `AppHost`; platform-specific SwiftUI or Jetpack Compose code is isolated in documented `*.ios` and `*.android` adapter files only.

Do not copy Penpot colors, dimensions, or raw controls directly into feature screens.

## Current scope

The current implementation has a thin adapter layer and one large Home route. Most Penpot screens describe forthcoming Epics 4–6 rather than existing debt. This initiative therefore combines remediation with preventative architecture.

## Delivery sequence

1. Stabilize and split the current Home composition.
2. Fill adapter gaps before a feature needs them.
3. Implement feature UI in roadmap order.
4. Apply cross-flow polish and perform the bilingual accessibility audit in Epic 7.
