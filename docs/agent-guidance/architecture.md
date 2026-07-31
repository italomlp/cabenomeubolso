# Architecture guidance

Load for app structure, routes, state, repositories, native dependencies, or release-boundary work.

## Keep the boundary

```text
Expo Router screen → controller/UI state → use case → repository port → SQLite adapter
```

- Keep domain types, rules, use cases, and repository ports free of Expo, SQLite, Zustand, and future-sync imports.
- Let screens call use cases, never SQL. Let adapters return domain models, never database rows.
- Keep SQLite as the domain source of truth. Zustand holds preferences and transient UI state only.
- Add remote sync only as an adapter at the composition root; do not change calculation or repository contracts.

```ts
interface ShoppingListRepository {
  get(id: string): Promise<ShoppingList | null>;
  save(list: ShoppingList): Promise<void>;
}
```

## Platform and release boundaries

- Use Expo Router and the approved dependency catalog. Resolve Expo packages with `npx expo install`.
- Isolate platform-only UI in `*.ios` and `*.android` adapters.
- Treat web SQLite as alpha until separately validated.
- A native dependency or config-plugin change requires a new native build; EAS Update ships compatible JS/assets only.

Read [V2 architecture](../v2/architecture.md) before changing these boundaries. For persistence details, read [domain and persistence](./domain-and-persistence.md).
