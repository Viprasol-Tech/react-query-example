import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useTodoApi } from "./QueryProvider.js";
import { queryKeys } from "./queryKeys.js";
import type { Todo } from "./api.js";

/**
 * Typed query hook that fetches the todo list from the active API client.
 *
 * The result is a fully-typed {@link UseQueryResult} so consumers get
 * `data`, `isLoading`, `error`, and friends with `Todo[]` inference.
 */
export function useTodos(): UseQueryResult<Todo[], Error> {
  const api = useTodoApi();

  return useQuery<Todo[], Error>({
    queryKey: queryKeys.todos.list(),
    queryFn: () => api.getTodos(),
  });
}
