import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTodoApi } from "./QueryProvider.js";
import { queryKeys } from "./queryKeys.js";
import type { TodoApi } from "./api.js";

/**
 * Returns memoized prefetch callbacks that warm the cache before a component
 * mounts — e.g. on link hover or focus. Prefetching populates the same cache
 * keys the corresponding hooks read, so the data is already there on render.
 */
export interface PrefetchApi {
  /** Prefetch the flat todo list. */
  prefetchTodos: () => Promise<void>;
  /** Prefetch a single user by id. */
  prefetchUser: (userId: number) => Promise<void>;
  /** Prefetch the todos owned by a user. */
  prefetchTodosByUser: (userId: number) => Promise<void>;
}

export function usePrefetch(): PrefetchApi {
  const api: TodoApi = useTodoApi();
  const queryClient = useQueryClient();

  const prefetchTodos = useCallback(
    () =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.todos.list(),
        queryFn: () => api.getTodos(),
      }),
    [api, queryClient],
  );

  const prefetchUser = useCallback(
    (userId: number) =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.users.detail(userId),
        queryFn: () => api.getUser(userId),
      }),
    [api, queryClient],
  );

  const prefetchTodosByUser = useCallback(
    (userId: number) =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.todos.byUser(userId),
        queryFn: () => api.getTodosByUser(userId),
      }),
    [api, queryClient],
  );

  return { prefetchTodos, prefetchUser, prefetchTodosByUser };
}
