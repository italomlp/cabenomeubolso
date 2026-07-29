# V2 design system

## Approach

Use project-owned semantic tokens and adapters. Prefer universal `@expo/ui` components inside `Host`; use SwiftUI/Compose-only APIs only behind platform-isolated adapters. Features consume semantic components, never raw platform controls or screen-specific colors.

## Tokens and themes

Default mode is System; Light and Dark are persisted overrides. Define token values for each mode, not separate feature palettes.

| Category | Semantic tokens | Rule |
|---|---|---|
| Color | `surface`, `surfaceRaised`, `onSurface`, `muted`, `border`, `focus` | contrast and focus remain visible in both modes |
| Budget | `budgetSafe`, `budgetRisk`, `budgetNeutral` | pair color with text/icon; never block overspend |
| Typography | `body`, `label`, `title`, `display`, `numeric` | support dynamic type; use tabular numerals where available |
| Space/layout | `space.*`, `radius.*`, `touchTarget`, `contentMax` | minimum 44×44 pt controls; avoid clipped totals |
| Motion | `motion.*` | useful feedback only; respect reduced motion |

## Component boundary

Provide adapters such as `AppHost`, `AppButton`, `AppTextField`, `AppSelect`, `AppSheet`, `BudgetSummary`, and `AdSlot`. They translate tokens, accessibility props, and platform differences. Domain/use-case code imports none of them. A missing universal capability must be documented, then implemented in `*.ios`/`*.android` adapters rather than leaked into feature screens.

## Accessibility and localization

- Translate copy, validation, labels, hints, and live announcements in `pt-BR` and `en`.
- Preserve focus after mutations; announce total/over-budget changes without interrupting entry.
- Test dynamic type, TalkBack/VoiceOver, touch targets, contrast, reduced motion, and bilingual expansion.
- Format and parse money/quantity at the UI boundary; tokens do not determine a list’s currency.

## Roadmap sequencing

1. **Epic 2 — foundations:** define the token contract, theme resolver, `Host`, universal adapters, and documented platform-isolated exceptions before feature UI.
2. **Epics 4–6 — feature UI:** consume those adapters only; do not introduce raw controls, screen-specific colors, or competing UI patterns.
3. **Epic 7 — visual polish and accessibility:** apply the system across Home, planning, shopping, Summary, Templates, Trash, and Settings; refine budget/empty/error/destructive states and complete the bilingual accessibility audit.
4. Complete Layout → Theme → Animation review with owner approval before visual finalization.
