import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useTodoApi } from "./QueryProvider.js";
import { queryKeys } from "./queryKeys.js";
import type { Todo, TodoPatch } from "./api.js";

/** Variables for {@link useUpdateTodo}. */
export interface UpdateTodoVariables {
  id: number;
  patch: TodoPatch;
}

/** Snapshot captured in `onMutate` so we can roll back on error. */
interface UpdateContext {
  previous: Todo[] | undefined;
}

/**
 * Optimistic patch of a todo (title and/or completed) with rollback.
 *
 * Mirrors {@link useToggleTodo}: it cancels in-flight list fetches, snapshots
 * the cache, applies the patch optimistically, rolls back on error, and
 * invalidates on settle.
 */
export function useUpdateTodo(): UseMutationResult<
  Todo,
  Error,
  UpdateTodoVariables,
  UpdateContext
> {
  const api = useTodoApi();
  const queryClient = useQueryClient();
  const listKey = queryKeys.todos.list();

  return useMutation<Todo, Error, UpdateTodoVariables, UpdateContext>({
    mutationFn: ({ id, patch }) => api.updateTodo(id, patch),

    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: listKey });

      const previous = queryClient.getQueryData<Todo[]>(listKey);

      queryClient.setQueryData<Todo[]>(listKey, (current) =>
        (current ?? []).map((todo) =>
          todo.id === id ? { ...todo, ...patch } : todo,
        ),
      );

      return { previous };
    },

    onError: (_error, _vars, context) => {
      if (context !== undefined) {
        queryClient.setQueryData<Todo[]>(listKey, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}
