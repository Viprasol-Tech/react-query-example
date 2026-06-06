/**
 * react-query-example — public API.
 *
 * TanStack React Query examples: typed hooks, caching, and mutations over a
 * pluggable API client (with an in-memory fake client by default).
 */
export type { Todo, NewTodo, TodoApi } from "./api.js";
export { createFakeTodoApi } from "./api.js";
export { queryKeys } from "./queryKeys.js";
export type { TodosQueryKey } from "./queryKeys.js";
export { QueryProvider, useTodoApi } from "./QueryProvider.js";
export type { QueryProviderProps } from "./QueryProvider.js";
export { useTodos } from "./useTodos.js";
export { useAddTodo } from "./useAddTodo.js";
