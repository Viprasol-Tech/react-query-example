import {
  keepPreviousData,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTodoApi } from "./QueryProvider.js";
import { queryKeys } from "./queryKeys.js";
import type { TodoPage } from "./api.js";

/** Options for {@link usePaginatedTodos}. */
export interface UsePaginatedTodosOptions {
  /** Items per page. Defaults to `10`. */
  pageSize?: number;
  /** Zero-based starting page index. Defaults to `0`. */
  initialPage?: number;
}

/** Everything a paginated list UI needs: data plus navigation controls. */
export interface PaginatedTodos {
  /** The underlying query result for the current page. */
  query: UseQueryResult<TodoPage, Error>;
  /** Current zero-based page index. */
  page: number;
  /** Total number of pages, derived from `total` and `pageSize`. */
  pageCount: number;
  /** Whether a previous page exists. */
  hasPrevious: boolean;
  /** Whether a next page exists. */
  hasNext: boolean;
  /** Go to the previous page (no-op at the first page). */
  previous: () => void;
  /** Go to the next page (no-op at the last page). */
  next: () => void;
  /** Jump to an arbitrary (clamped) page index. */
  goTo: (page: number) => void;
}

/**
 * Classic page-based pagination with stable navigation controls.
 *
 * Uses `placeholderData: keepPreviousData` so the previous page stays visible
 * while the next one loads (no flash of empty state), and prefetches the
 * adjacent next page whenever data is available for instant forward paging.
 */
export function usePaginatedTodos(
  options: UsePaginatedTodosOptions = {},
): PaginatedTodos {
  const api = useTodoApi();
  const queryClient = useQueryClient();
  const pageSize = Math.max(1, options.pageSize ?? 10);
  const [page, setPage] = useState(Math.max(0, options.initialPage ?? 0));

  const query = useQuery<TodoPage, Error>({
    queryKey: [...queryKeys.todos.page(), { page, pageSize }],
    queryFn: () =>
      api.getTodoPage({ cursor: page * pageSize, limit: pageSize }),
    placeholderData: keepPreviousData,
  });

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const hasPrevious = page > 0;
  const hasNext = query.data?.nextCursor != null;

  // Prefetch the next page so forward navigation is instant.
  if (hasNext) {
    const nextPage = page + 1;
    void queryClient.prefetchQuery({
      queryKey: [...queryKeys.todos.page(), { page: nextPage, pageSize }],
      queryFn: () =>
        api.getTodoPage({ cursor: nextPage * pageSize, limit: pageSize }),
    });
  }

  const goTo = useCallback(
    (target: number) => {
      setPage((current) => {
        const clamped = Math.max(0, target);
        return clamped === current ? current : clamped;
      });
    },
    [setPage],
  );

  const previous = useCallback(() => {
    setPage((current) => (current > 0 ? current - 1 : current));
  }, [setPage]);

  const next = useCallback(() => {
    setPage((current) => current + 1);
  }, [setPage]);

  return {
    query,
    page,
    pageCount,
    hasPrevious,
    hasNext,
    previous,
    next,
    goTo,
  };
}
