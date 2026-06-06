import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useTodoApi } from "./QueryProvider.js";
import { queryKeys } from "./queryKeys.js";
import type { Todo, TodoPage } from "./api.js";

/** Options for {@link useInfiniteTodos}. */
export interface UseInfiniteTodosOptions {
  /** Page size requested from the API. Defaults to `10`. */
  pageSize?: number;
}

/**
 * Cursor-paginated infinite query over todos.
 *
 * Each fetched page carries a `nextCursor`; when it is `null` there are no more
 * pages and `hasNextPage` becomes `false`. Use `fetchNextPage()` (typically
 * wired to a "Load more" button or an intersection observer) to append the next
 * page to `data.pages`.
 */
export function useInfiniteTodos(
  options: UseInfiniteTodosOptions = {},
): UseInfiniteQueryResult<InfiniteData<TodoPage, number>, Error> {
  const api = useTodoApi();
  const pageSize = options.pageSize ?? 10;

  return useInfiniteQuery({
    queryKey: queryKeys.todos.page(),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      api.getTodoPage({ cursor: pageParam, limit: pageSize }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: TodoPage): number | undefined =>
      lastPage.nextCursor ?? undefined,
  });
}

/**
 * Flattens the pages of an infinite todos result into a single `Todo[]`.
 * Convenient for rendering one continuous list.
 */
export function flattenTodoPages(
  data: InfiniteData<TodoPage, number> | undefined,
): Todo[] {
  if (data === undefined) {
    return [];
  }
  return data.pages.flatMap((page) => page.items);
}
