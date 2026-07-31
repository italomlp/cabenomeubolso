# UI adapter-boundary playbook

Load when adding or changing a control, semantic token, platform-specific UI capability, or accessibility behavior.

## Do

- Add feature UI through project-owned adapters and semantic tokens.
- Put a missing universal capability behind a documented `*.ios`/`*.android` adapter.
- Pass translated visible copy, labels, hints, validation, and announcements through the adapter API.
- Specify accessibility semantics, 44×44 pt targets, focus behavior, contrast, dynamic type, and reduced motion.
- Test theme resolution in Light, Dark, and System modes before feature screens depend on the adapter.

```tsx
<AppButton accessibilityLabel={t('list.save')} onPress={saveList}>
  {t('list.save')}
</AppButton>
```

## Don't

- Do not import raw platform controls, SwiftUI/Compose APIs, or screen-specific colors into feature screens.
- Do not leak UI adapters into domain or use-case code.
- Do not use color alone for budget status or omit translated accessibility semantics.
- Do not add a platform exception without documenting and isolating it.

## Validation checklist

- [ ] Feature code imports only project adapters and semantic tokens.
- [ ] The adapter boundary and theme resolver have tests; a sample route works in Light, Dark, and System.
- [ ] VoiceOver/TalkBack labels, hints, focus after mutation, and non-interrupting total announcements work in `pt-BR` and `en`.
- [ ] Dynamic type, touch targets, contrast, reduced motion, and bilingual text expansion pass device review.
- [ ] Any platform exception is documented and contained in `*.ios`/`*.android` code.

Sources: [V2 design system](../../v2/design-system.md), [Epic 2](../../v2/roadmap/02-design-system-foundations.md), and [UI guidance](../ui-and-accessibility.md).
