# V2 UX and design direction

## Inferred current experience

The legacy app has a simple stack flow: list overview, a three-step list editor, an in-store item flow, and a finalized review that can clone a list. It already communicates a fixed budget and separates completed items. Its weaknesses are a multi-screen, modal-like shopping flow; progress that appears locally until finalization; no trash, recurrence, theme, or direct in-session item creation; and limited visual hierarchy for budget risk.

## V2 design principles

- **Budget first:** show remaining amount and status before secondary metadata.
- **One-hand shopping:** complete, edit, and add from the active-list screen with immediate persistence.
- **Calm, not punitive:** red indicates an over-budget state; it never blocks a purchase.
- **Plain language:** distinguish *planned* from *actual* everywhere.
- **Recoverable actions:** soft delete with Undo/Trash rather than destructive swipes alone.
- **Language and currency are separate:** labels follow the resolved app language; each list visibly retains its own BRL or USD currency.

## Navigation

Use Expo Router layouts and filesystem routes:

```text
/(tabs)/home                 active and finalized lists
/list/new                    create plan
/list/[id]                   plan/edit list
/list/[id]/shop              active shopping session
/list/[id]/summary           finalized review
/templates                   recurring templates
/trash                       deleted lists and items
/settings                    theme, language, default currency, privacy options when required, and entitlement status
```

Keep Home, Templates, and Settings as primary destinations; use stack routes for create, edit, shop, summary, and Trash. Do not make beta native tabs a migration dependency.

## Key screens

| Screen | Must make easy | Primary content |
|---|---|---|
| Home | resume or create | list name, budget, actual/planned progress, status |
| Plan/edit | build a realistic list | budget field, planned item rows, add item |
| Shop | make in-store changes | sticky actual/remaining summary, complete toggle, inline add/edit |
| Item editor | state prices unambiguously | unit selector, quantity, planned/actual price per selected unit, purchased state |
| Summary | understand outcome/reuse | planned vs actual, remaining/overage, bought/unbought sections |
| Templates | create an occurrence | template cadence and “Generate now” action |
| Trash | restore safely | deletion date, expiry date, restore/permanent delete |

### Budget summary states

```text
Budget R$ 400,00  Actual R$ 351,40  Remaining R$ 48,60  ✓ Within budget
Budget $100.00    Actual $103.05    Over by $3.05       ! Over budget
```

Use text and icon alongside color; do not rely on red/green alone. Format amounts for the list currency and explicit display locale, for example `R$ 400,00` in `pt-BR` or `$400.00` in `en-US`; do not rely on a symbol alone where it could be ambiguous.

## Language and money interaction

- Settings offers Portuguese (`pt-BR`) and English (`en`) choices. “System” removes the override and uses the documented device-language resolution; the persisted supported override wins when present.
- Settings starts with language set to **System**. It resolves a supported saved override first, then a supported OS language, then English.
- Settings also offers an explicit default currency (`BRL` or `USD`) for new lists. Before a user chooses one, propose the first locale's supported `currencyCode`, then `BR`/`US` region mapping, then BRL. Do not request location or use timezone; this is independent of language and must not change existing lists.
- The create-list flow shows the selected currency before budget entry. List headers, summaries, templates, and clone flows show their ISO-aware currency consistently.
- A list currency is immutable once it has items or actual spending. The UI directs the user to start or clone a new list rather than silently convert values. The behavior for an empty list remains an owner decision.
- Display money with `Intl.NumberFormat`. Accept editable money using the selected input locale’s separators, validate it at the UI boundary, and pass integer minor units to domain code. Never save or calculate from formatted text or floats.

## Quantity and unit input

- Show a unit selector with exactly `piece`, `pack`, `kg`, `g`, `l`, and `ml`. Store the code; show a translated label. Do not offer custom units.
- Hold quantity as raw text while the field is focused. `inputMode="decimal"` and `keyboardType="decimal-pad"` only request a keyboard; they do not validate input.
- On commit or blur, parse using the explicit input locale’s separators. Permit intermediate typing states such as an empty value or trailing separator; do not format text while editing. After a valid commit, display the locale-formatted quantity and translated unit.
- Accept positive whole numbers for `piece`, `pack`, `g`, and `ml`; accept positive values with at most three decimal places for `kg` and `l`. Reject zero/negative values, ambiguous formatting, unsupported precision, fractional integer-only units, and overflow with translated, field-level errors.
- Label planned and actual prices as “per [unit]”. Changing the unit changes the pricing meaning; V2 never converts the entered price.

| UI locale | Valid quantity examples | Reject |
|---|---|---|
| `pt-BR` | `2 peças`, `1,5 kg`, `500 g`, `0,750 l` | `1,5 g`, `1,2345 kg` |
| `en` | `2 pieces`, `1.5 kg`, `500 g`, `0.750 l` | `1.5 ml`, `1.2345 l` |

## Theme and accessibility

- Default to **System** and offer explicit Light and Dark preferences.
- Define semantic tokens (`surface`, `onSurface`, `budgetSafe`, `budgetRisk`, `focus`) rather than screen-specific colors.
- Support dynamic type without clipping totals; use tabular numerals for currency where available.
- Give every icon-only control an accessible label and a 44×44 pt minimum target.
- Translate visible copy, validation messages, accessible labels, hints, and live-region announcements. Test both languages for truncation and text expansion; controls must not hide a BRL/USD amount at larger text sizes.
- Announce changed totals and over-budget transitions to assistive technology without interrupting entry.
- Preserve focus after save, completion, restore, and validation errors; provide visible focus indicators for web/keyboard use.

## Advertising boundaries

- When the release flag is enabled, show an adaptive banner **after list content on Home** and an inline banner in a **finalized Summary** only.
- Never show an ad while planning or actively shopping; interstitial and rewarded formats are out of scope.
- Development uses test ads only. Consent and any required privacy-options control must be available before ad initialization or requests.

## Logo and brand brief

**Idea:** a compact shopping basket or bag whose handle/contents form a subtle checkmark or contained coin—“it fits.” Avoid literal overflowing carts, tiny currency glyphs, and gradients needed for recognition.

- **Tone:** practical, warm, optimistic, financially reassuring.
- **Palette:** deep ink/charcoal foundation, one confident teal or green for safe progress, amber/red reserved for caution; all tokens must work in light and dark themes.
- **Typography:** highly legible sans serif; currency and totals receive stronger weight and stable numerals.
- **Deliverables:** wordmark, mark, monochrome mark, app icon, clear-space/minimum-size rules, and light/dark usage examples.

Run design work as Layout → Theme → Animation → implementation, with owner approval between stages. Keep motion limited to useful state changes (completion, summary update, modal/sheet) and honor reduced-motion settings.
