import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useTodoApi } from "./QueryProvider.js";
import { queryKeys } from "./queryKeys.js";
import type { Todo, User } from "./api.js";

/**
 * Dependent (chained) query: fetch a {@link User} by id.
 *
 * `enabled` is `false` while `userId` is `null`, so the query stays idle until
 * an id is available — the canonical pattern for queries whose inputs come from
 * another async source.
 */
export function useUser(userId: number | null): UseQueryResult<User, Error> {
  const api = useTodoApi();

  return useQuery<User, Error>({
    queryKey: queryKeys.users.detail(userId ?? -1),
    queryFn: () => api.getUser(userId as number),
    enabled: userId !== null,
  });
}

/**
 * Dependent query that only runs once its prerequisite user has loaded.
 *
 * Pass the result of {@link useUser} (or any boolean) as `enabled`. The todos
 * fetch stays idle until the user is ready, then loads that user's todos.
 */
export function useTodosByUser(
  userId: number | null,
  enabled: boolean,
): UseQueryResult<Todo[], Error> {
  const api = useTodoApi();

  return useQuery<Todo[], Error>({
    queryKey: queryKeys.todos.byUser(userId ?? -1),
    queryFn: () => api.getTodosByUser(userId as number),
    enabled: enabled && userId !== null,
  });
}
