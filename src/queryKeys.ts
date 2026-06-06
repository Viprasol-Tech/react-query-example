/**
 * Centralized, typed query keys built as a hierarchical factory. Keeping keys
 * in one place avoids typos and makes targeted cache invalidation predictable:
 * invalidating `queryKeys.todos.all` matches every todo-related query because
 * they all share the `["todos"]` prefix.
 */
export const queryKeys = {
  todos: {
    /** Root prefix for every todo-related query. */
    all: ["todos"] as const,
    /** Flat list of all todos. */
    list: () => [...queryKeys.todos.all, "list"] as const,
    /** Paginated/infinite list of todos. */
    page: () => [...queryKeys.todos.all, "page"] as const,
    /** Todos filtered by owning user. */
    byUser: (userId: number) =>
      [...queryKeys.todos.all, "byUser", userId] as const,
  },
  users: {
    all: ["users"] as const,
    detail: (id: number) => [...queryKeys.users.all, "detail", id] as const,
  },
} as const;

export type TodosListKey = ReturnType<typeof queryKeys.todos.list>;
export type TodosPageKey = ReturnType<typeof queryKeys.todos.page>;
export type TodosByUserKey = ReturnType<typeof queryKeys.todos.byUser>;
export type UserDetailKey = ReturnType<typeof queryKeys.users.detail>;
