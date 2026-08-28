# Epic 9 QA evidence

This document records the bounded Epic 9.1/9.3 validation work without
turning unrun device checks into release claims.

## Regression matrix

| Area | Matrix / journey | Evidence | Status |
| --- | --- | --- | --- |
| Quantity input | `pt-BR` and `en` × `piece`, `pack`, `kg`, `g`, `l`, `ml` | `src/tests/qa/epic9-locale-matrix.test.ts` | Automated (suite: 14 passed) |
| Currency input | `pt-BR` and `en` × explicit `BRL` and `USD` | `src/tests/qa/epic9-locale-matrix.test.ts` | Automated (suite: 14 passed) |
| Currency/language independence | Explicit currency remains selected under either language/device locale | `src/tests/qa/epic9-locale-matrix.test.ts` | Automated (suite: 14 passed) |
| System currency resolution | `en-US` language tag + fixed `BR` region resolves `BRL`; a fixed `US` region resolves `USD` even with `pt-BR` language | `src/tests/qa/epic9-locale-matrix.test.ts` | Automated (suite: 14 passed) |
| Offline create and persistence | Create a named list; generate a persisted occurrence; enable airplane mode; kill the app process; relaunch with `clearState: false` | `.maestro/offline-journey.yaml` | Syntax validated; Android/English device run pending |
| Shop and finalize | Deterministic development fixture, shopping, confirmation, summary | `.maestro/offline-journey.yaml` | Flow added; Android/English device run pending |
| Manual template generation | Create from latest list → Generate now → Home → relaunch | `.maestro/offline-journey.yaml` | Flow added; Android/English device run pending |
| Trash restore | Restore a deleted list | — | Pending product/harness support |

The matrix test was run with Node/Jest in this worktree (14 tests passed). Maestro syntax for
`.maestro/offline-journey.yaml` also passed. The flow uses supported
`setAirplaneMode`, `killApp`, `launchApp(clearState: false)`, and
`onFlowComplete` cleanup. No device execution is implied; the cleanup hook
restores the runner to an online baseline, but Maestro does not expose a
portable way to preserve an already-enabled airplane-mode state.

The existing development reset harness seeds an active list with a stable ID,
which is used for the shopping and template route. The current UI exposes no
list-delete action and the harness exposes no deleted-list fixture, so the
Maestro flow verifies the reachable empty Trash state instead of claiming a
restore run. A future flow can replace that assertion once a deterministic
deleted-list setup and stable delete/restore selectors exist.

The Maestro flow's device prerequisite is an Android emulator/device with the
system UI language set to English. It uses test IDs wherever available and
English text selectors only where the current app exposes no test ID. Maestro
syntax validation is not evidence for iOS, another device language, or a
completed device run.

## Accessibility evidence

The source includes explicit labels, hints, selected state, and live
announcements on the covered controls. The following require a real device or
emulator and are **pending**; they were not inferred from source inspection:

- TalkBack traversal and announcements (Android)
- VoiceOver traversal and announcements (iOS)
- Dynamic Type / large-font layout and text expansion
- Reduced-motion behavior
- Focus order, focus return, and keyboard dismissal on both platforms

## Commands

The assigned automated check is:

```sh
npm test -- --runInBand src/tests/qa/epic9-locale-matrix.test.ts
```

The Maestro flow should be syntax-checked separately with:

```sh
maestro check-syntax .maestro/offline-journey.yaml
```

Neither command is evidence of a physical accessibility run. Record device,
OS, build, locale, and result alongside this document when those checks are
performed.
