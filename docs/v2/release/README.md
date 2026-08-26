# V2 release readiness

Templates and checklists for Epic 9 (release readiness). These are **working
documents**, not release claims: fill them in only when the corresponding
owner decision is recorded. Nothing in this directory is a shipped assertion.

## Blocked owner inputs

Release work depends on five owner decisions that are **not made yet**. Every
file in this directory marks them explicitly so no unsupported claim ships.

| # | Owner input | Where it blocks | Status |
|---|---|---|---|
| 1 | **Store identity** — retain the existing Android app identity/listing, or create a new V2 listing? | Store listing, screenshots, package/application IDs, credentials | ⚠️ BLOCKED |
| 2 | **Signing** — who owns the Android release keystore and Play signing key; where are they stored? | Android release build, store submission | ⚠️ BLOCKED |
| 3 | **EAS Update policy** — which channels and `runtimeVersion` policy? | Production OTA delivery | ⚠️ BLOCKED |
| 4 | **Privacy** — privacy-policy URL and store data-safety disclosures | Store listing, legal | ⚠️ BLOCKED |
| 5 | **Ads** — AdMob is installed and disabled by default; confirm it stays off for release | Store data-safety, listing | ⚠️ BLOCKED (default: off) |

See `docs/v2/decisions-and-open-questions.md` (gates 1, 7, 8) for the
authoritative decision log. Do not resolve these here.

## Documents

- `release-checklist.md` — end-to-end release checklist and owner-acceptance record.
- `store-listing-template.md` — Android store listing copy and asset list.
- `privacy-policy-template.md` — privacy policy draft.
- `data-safety-form-template.md` — Google Play Data safety form answers.
- `eas-policy-and-signing-template.md` — EAS Update policy and signing/credentials decisions.

## Legend

- `[ ]` — pending / not started.
- `[x]` — completed with evidence recorded.
- `⚠️ BLOCKED` — requires an owner input listed above; do not claim completion.
