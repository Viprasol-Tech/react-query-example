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
 * optimistic-style cache update) and then invalidates the todos query so any
 * background refetch reconciles with the source of truth.
 */
export function useAddTodo(): UseMutationResult<Todo, Error, NewTodo> {
  const api = useTodoApi();
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, NewTodo>({
    mutationFn: (input: NewTodo) => api.addTodo(input),
    onSuccess: (created) => {
      // Update the cache immediately so the UI reflects the new todo.
      queryClient.setQueryData<Todo[]>(queryKeys.todos, (prev) =>
        prev ? [...prev, created] : [created],
      );
      // Mark the list stale so it refetches and reconciles with the server.
      void queryClient.invalidateQueries({ queryKey: queryKeys.todos });
    },
  });
}
