import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrefetch } from "./usePrefetch.js";
import { useUser } from "./useUserTodos.js";
import { queryKeys } from "./queryKeys.js";
import { makeHarness, manyTodos } from "./testUtils.js";

describe("usePrefetch", () => {
  it("warms the todos list cache before any component reads it", async () => {
    const { Wrapper, queryClient } = makeHarness({ seed: manyTodos(3) });

    const { result } = renderHook(() => usePrefetch(), { wrapper: Wrapper });

    expect(
      queryClient.getQueryData(queryKeys.todos.list()),
    ).toBeUndefined();

    await act(async () => {
      await result.current.prefetchTodos();
    });

    expect(queryClient.getQueryData(queryKeys.todos.list())).toHaveLength(3);
  });

  it("prefetched user data is read synchronously by useUser", async () => {
    const { Wrapper } = makeHarness();

    const { result, rerender } = renderHook(
      ({ id }: { id: number | null }) => {
        const prefetch = usePrefetch();
        const user = useUser(id);
        return { prefetch, user };
      },
      { wrapper: Wrapper, initialProps: { id: null as number | null } },
    );

    await act(async () => {
      await result.current.prefetch.prefetchUser(2);
    });

    // Now enable the query; data should already be in the cache.
    rerender({ id: 2 });
    expect(result.current.user.data?.name).toBe("Alan Turing");
  });

  it("prefetchTodosByUser populates the per-user cache key", async () => {
    const { Wrapper, queryClient } = makeHarness({
      seed: manyTodos(2, 1),
    });

    const { result } = renderHook(() => usePrefetch(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.prefetchTodosByUser(1);
    });

    expect(
      queryClient.getQueryData(queryKeys.todos.byUser(1)),
    ).toHaveLength(2);
  });
});
