# Epic 7: Visual polish and accessibility

## Goal

Apply the established visual system consistently across completed flows and complete accessibility validation.

## Scope / non-scope

**Scope:** cross-flow application of existing adapters, state refinement, visual polish, and full bilingual/accessibility audit. **Non-scope:** new tokens, `Host`, adapters, generic UI libraries, raw platform API use in features, or new workflows.

## Prerequisites

- [ ] Epic 2 design-system foundations.
- [ ] Core planning, shopping, Trash, and Templates flows available.
- [ ] Owner layout/theme approval before final visual direction.

## Tasks

- [ ] **7.1 Apply adapters and refine states across flows.** Home, plan, shop, Summary, Trash, Templates, Settings; budget/empty/error/destructive states. **Files:** feature components/tests. **Estimate:** 2h. **Dependencies:** Epics 2 and 4–6. **Verification:** every flow uses the shared adapter API and no state relies on color alone.
- [ ] **7.2 Audit accessibility and bilingual layouts.** **Files:** tests/audit record. **Estimate:** 2h. **Dependencies:** 7.1. **Verification:** PT/EN, BRL/USD, dynamic type, focus, screen reader, touch target, contrast, and reduced-motion checks pass.
- [ ] **7.3 Complete visual-finalization review.** Complete Layout → Theme → Animation review with owner approval and record accepted exceptions. **Files:** review record/decision notes. **Estimate:** 2h. **Dependencies:** 7.1–7.2. **Verification:** approved screens have no undocumented platform exceptions.

## Files anticipated

Feature component updates, accessibility tests, and visual-review records; the token/theme, `Host`, adapter, and platform-isolation foundations remain in Epic 2.

## Dependencies

Requires Epic 2 and core flows from Epics 4–6; enables release validation.

## Validation / exit criteria

Core flows use the shared visual system coherently in all theme modes and pass supported accessibility settings.

## Test coverage

Cross-flow adapter/state tests plus manual TalkBack/VoiceOver, dynamic-type, contrast, reduced-motion, and bilingual-expansion audit.

## Risks

Late screen changes can bypass foundations; reject raw controls, screen-specific colors, and undocumented platform exceptions.

## Updated estimate

**6–8h, medium-high complexity.**
