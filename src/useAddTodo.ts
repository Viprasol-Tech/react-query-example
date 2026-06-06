import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useTodoApi } from "./QueryProvider.js";
import { queryKeys } from "./queryKeys.js";
import type { NewTodo, Todo } from "./api.js";

/**
 * Typed mutation hook that creates a todo and keeps the cache in sync.
 *
 * On success it writes the new todo directly into the cached list (a fast,
 * cache update) and then invalidates every todo-related query (by shared
 * prefix) so any background refetch reconciles with the source of truth.
 */
export function useAddTodo(): UseMutationResult<Todo, Error, NewTodo> {
  const api = useTodoApi();
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, NewTodo>({
    mutationFn: (input: NewTodo) => api.addTodo(input),
    onSuccess: (created) => {
      // Update the cached list immediately so the UI reflects the new todo.
      queryClient.setQueryData<Todo[]>(queryKeys.todos.list(), (prev) =>
        prev ? [...prev, created] : [created],
      );
      // Mark all todo queries stale so they refetch and reconcile.
      void queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}
