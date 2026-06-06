import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useTodoApi } from "./QueryProvider.js";
import { queryKeys } from "./queryKeys.js";
import type { Todo } from "./api.js";

/** Snapshot captured in `onMutate` so we can roll back on error. */
interface ToggleContext {
  previous: Todo[] | undefined;
}

/**
 * Optimistic toggle of a todo's `completed` flag with automatic rollback.
 *
 * Flow:
 * 1. `onMutate` cancels in-flight list fetches, snapshots the current cache,
 *    and flips the target todo immediately so the UI feels instant.
 * 2. If the mutation fails, `onError` restores the snapshot (rollback).
 * 3. `onSettled` invalidates the list to reconcile with the server either way.
 */
export function useToggleTodo(): UseMutationResult<
  Todo,
  Error,
  number,
  ToggleContext
> {
  const api = useTodoApi();
  const queryClient = useQueryClient();
  const listKey = queryKeys.todos.list();

  return useMutation<Todo, Error, number, ToggleContext>({
    mutationFn: (id: number) => api.toggleTodo(id),

    onMutate: async (id) => {
      // Prevent in-flight refetches from clobbering our optimistic write.
      await queryClient.cancelQueries({ queryKey: listKey });

      const previous = queryClient.getQueryData<Todo[]>(listKey);

      queryClient.setQueryData<Todo[]>(listKey, (current) =>
        (current ?? []).map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      );

      return { previous };
    },

    onError: (_error, _id, context) => {
      // Roll back to the snapshot taken before the optimistic update.
      if (context !== undefined) {
        queryClient.setQueryData<Todo[]>(listKey, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}
