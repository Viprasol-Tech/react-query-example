import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useInfiniteTodos,
  flattenTodoPages,
} from "./useInfiniteTodos.js";
import { makeHarness, manyTodos } from "./testUtils.js";

describe("useInfiniteTodos", () => {
  it("loads the first page and reports more pages", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(25) });

    const { result } = renderHook(() => useInfiniteTodos({ pageSize: 10 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.data?.pages[0]?.items).toHaveLength(10);
    expect(result.current.data?.pages[0]?.total).toBe(25);
    expect(result.current.hasNextPage).toBe(true);
  });

  it("appends subsequent pages via fetchNextPage", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(25) });

    const { result, rerender } = renderHook(
      () => useInfiniteTodos({ pageSize: 10 }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });
    rerender();
    expect(result.current.data?.pages).toHaveLength(2);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });
    rerender();
    expect(result.current.data?.pages).toHaveLength(3);

    // 10 + 10 + 5 = 25, and no further pages.
    const flat = flattenTodoPages(result.current.data);
    expect(flat).toHaveLength(25);
    expect(result.current.hasNextPage).toBe(false);
  });

  it("reports no next page when all items fit in one page", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(3) });

    const { result } = renderHook(() => useInfiniteTodos({ pageSize: 10 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(false);
    expect(flattenTodoPages(result.current.data)).toHaveLength(3);
  });

  it("flattenTodoPages returns [] for undefined data", () => {
    expect(flattenTodoPages(undefined)).toEqual([]);
  });
});
