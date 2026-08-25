# Epic 7 native UI audit

Status: recorded for PR #52 review. Gate 6 visual direction is deferred and is not approved.

## Reviewed fixes

- Native `AppButton` primary actions use the existing semantic `focus` token in both themes.
- Purchase-save failures are handled at the screen boundary and keep the localized error visible without an unhandled rejection.
- Shopping and summary operations use operation-specific localized errors in English and Brazilian Portuguese.

## Owner decisions and exceptions

- **Deferred:** high-fidelity palette direction, logo direction, and typography direction. No palette, logo, or typography changes are approved by this audit.
- **Deferred:** broader native UI visual polish beyond the focused PR #52 fixes above.

The existing semantic tokens, adapters, and current visual direction remain the source of truth until Gate 6 is explicitly approved.
