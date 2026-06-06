# Changelog

Format based on [Keep a Changelog](https://keepachangelog.com/); versioning
follows [SemVer](https://semver.org/).

## [0.2.0] - 2025

### Added
- **Infinite query** (`useInfiniteTodos`) — cursor-based pagination with
  `fetchNextPage`, `hasNextPage`, and a `flattenTodoPages` helper.
- **Page-based pagination hook** (`usePaginatedTodos`) — stable `next`/
  `previous`/`goTo` controls, `keepPreviousData` placeholder behavior, derived
  `pageCount`, and automatic prefetch of the adjacent next page.
- **Optimistic updates with rollback** — `useToggleTodo` and `useUpdateTodo`
  snapshot the cache in `onMutate`, apply changes instantly, roll back in
  `onError`, and reconcile in `onSettled`.
- **Dependent (chained) queries** — `useUser` and `useTodosByUser` demonstrate
  `enabled`-gated queries that wait for prerequisite data.
- **Prefetching** (`usePrefetch`) — memoized callbacks to warm the cache on
  hover/focus before a component mounts.
- **Hierarchical, typed query keys** — `queryKeys` is now a factory enabling
  precise prefix-based invalidation across all todo queries.
- Extended `TodoApi` with `updateTodo`, `toggleTodo`, `getTodoPage`, `getUser`,
  and `getTodosByUser`; the fake client gained users and optional latency.
- Shared test harness (`testUtils`) and roughly 4x more tests covering every
  new hook, including rollback and dependent-query chains.

### Changed
- `createFakeTodoApi` now accepts a `FakeApiOptions` object (`seed`, `users`,
  `latencyMs`) instead of a bare seed array.
- `useAddTodo` now invalidates by the shared `["todos"]` prefix so every
  todo-related query refetches.

## [0.1.0] - 2025

### Added
- Initial release of react-query-example: TanStack React Query examples - typed hooks, caching, and mutations.
