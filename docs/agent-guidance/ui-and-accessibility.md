# UI and accessibility guidance

Load for screens, components, themes, localization, forms, motion, or accessibility validation.

## Use the shared UI boundary

- Features use project-owned semantic tokens and adapters such as `AppButton`, `AppTextField`, and `AppSheet`.
- Do not introduce raw platform controls, screen-specific colors, or direct SwiftUI/Compose APIs in feature screens.
- Put missing platform capabilities behind documented `*.ios`/`*.android` adapters.

```tsx
<AppButton
  accessibilityLabel={t('list.save')}
  onPress={saveList}
>
  {t('list.save')}
</AppButton>
```

## Make behavior explicit

- Translate visible copy, labels, hints, validation, and announcements in `pt-BR` and `en`.
- Preserve focus after mutations. Announce total and over-budget changes without interrupting entry.
- Support dynamic type, 44×44 pt targets, visible focus, contrast, reduced motion, and bilingual text expansion.
- Parse money and quantity from raw input with the explicit input locale. A locale never changes a list's currency.

Read [V2 design system](../v2/design-system.md) for tokens and adapter requirements. Read [V2 data and rules](../v2/data-and-rules.md) before implementing monetary or quantity fields.
