# Native feel and accessibility

## Native-feel checklist

- Start with universal `@expo/ui` components within `AppHost`.
- Use a platform-isolated adapter only when universal UI cannot provide the needed behavior or accessibility semantics.
- Prefer standard stacks, titles, grouped settings rows, native sheets, dialogs, menus, and controls over imitating one platform on the other.
- Keep one shared domain flow across iOS and Android; vary presentation only where native convention differs.
- Use motion for useful feedback only: item completion, budget-summary change, and sheet presentation. Respect reduced-motion settings.

## Accessibility checklist

- [ ] Every feature uses semantic adapters and tokens only.
- [ ] Visible copy, labels, hints, validation, and announcements exist in `pt-BR` and `en`.
- [ ] Every icon-only action has a label and 44×44 pt target.
- [ ] Budget status includes color, text, and icon.
- [ ] Dynamic type and bilingual text expansion do not clip names, controls, or BRL/USD totals.
- [ ] Focus is restored after save, completion, restore, and validation failures.
- [ ] Total and over-budget changes are announced without interrupting data entry.
- [ ] Light, Dark, and System theme modes are verified.
- [ ] Reduced motion, contrast, VoiceOver, and TalkBack receive device-level review before closure.

## Money and quantity interaction rules

- Format money with `Intl.NumberFormat` for the list currency and display locale.
- Parse editable money and quantity at the UI boundary using an explicit input locale.
- Store and pass safe integer minor units and `quantity_milli`; never calculate from floats or formatted text.
- Permit intermediate typing states while a field is focused. Validate on commit or blur and show translated field-level feedback.
- Units are the closed catalog: `piece`, `pack`, `kg`, `g`, `l`, and `ml`.
