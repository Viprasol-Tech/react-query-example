/**
 * Centralized, typed query keys. Keeping keys in one place avoids typos and
 * makes cache invalidation predictable across the app.
 */
export const queryKeys = {
  todos: ["todos"] as const,
};

export type TodosQueryKey = typeof queryKeys.todos;
