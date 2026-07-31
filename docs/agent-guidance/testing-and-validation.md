# Testing and validation guidance

Load for tests, migration work, review, device checks, release preparation, or acceptance criteria.

## Validate independently

1. Test pure domain rules in isolation.
2. Test repositories against empty and representative prior-schema fixtures.
3. Run lint, tests, typecheck, and `npx expo-doctor@latest` when applicable.
4. Review boundaries and behavior separately from the implementation author.

```ts
expect(calculateActualMinor({ quantityMilli: 1500, unitMinor: 200 }))
  .toBe(300);
```

## Minimum coverage by change

| Change | Verify |
|---|---|
| Money or quantity | Integer rounding, invalid input, PT/EN × BRL/USD formatting/parsing |
| Migration | Empty DB, each supported prior fixture, rollback/error behavior, preserved soft deletes |
| Multi-row write | Transactionality, concurrent-write serialization, currency-lock behavior |
| UI | TalkBack/VoiceOver, dynamic type, touch target, focus, contrast, reduced motion, both languages |
| Native/config dependency | Development build and rebuild requirement; never rely on Expo Go when unsupported |

Use real migration fixtures, not only mocks. Check [V2 architecture](../v2/architecture.md) and [V2 data and rules](../v2/data-and-rules.md) for required behavior; check [V2 release guidance](../v2/implementation-handoff.md) before release work.
