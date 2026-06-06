/**
 * react-query-example — public API.
 *
 * TanStack React Query examples: typed query/mutation hooks, infinite &
 * page-based pagination, optimistic updates with rollback, dependent queries,
 * prefetching, and prefix-based invalidation — all over a pluggable API client
 * (with an in-memory fake client by default).
 */
export type {
  Todo,
  NewTodo,
  TodoPatch,
  TodoApi,
  TodoPage,
  PageQuery,
  User,
  FakeApiOptions,
} from "./api.js";
export { createFakeTodoApi } from "./api.js";

export { queryKeys } from "./queryKeys.js";
export type {
  TodosListKey,
  TodosPageKey,
  TodosByUserKey,
  UserDetailKey,
} from "./queryKeys.js";

export { QueryProvider, useTodoApi } from "./QueryProvider.js";
export type { QueryProviderProps } from "./QueryProvider.js";

export { useTodos } from "./useTodos.js";
export { useAddTodo } from "./useAddTodo.js";

export { useInfiniteTodos, flattenTodoPages } from "./useInfiniteTodos.js";
export type { UseInfiniteTodosOptions } from "./useInfiniteTodos.js";

export { useToggleTodo } from "./useToggleTodo.js";

export { useUpdateTodo } from "./useUpdateTodo.js";
export type { UpdateTodoVariables } from "./useUpdateTodo.js";

export { useUser, useTodosByUser } from "./useUserTodos.js";

export { usePrefetch } from "./usePrefetch.js";
export type { PrefetchApi } from "./usePrefetch.js";

export { usePaginatedTodos } from "./usePaginatedTodos.js";
export type {
  UsePaginatedTodosOptions,
  PaginatedTodos,
} from "./usePaginatedTodos.js";
