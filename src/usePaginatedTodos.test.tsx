import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { usePaginatedTodos } from "./usePaginatedTodos.js";
import { makeHarness, manyTodos } from "./testUtils.js";

describe("usePaginatedTodos", () => {
  it("loads the first page and derives page metadata", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(25) });

    const { result } = renderHook(() => usePaginatedTodos({ pageSize: 10 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    expect(result.current.page).toBe(0);
    expect(result.current.query.data?.items).toHaveLength(10);
    expect(result.current.pageCount).toBe(3);
    expect(result.current.hasPrevious).toBe(false);
    expect(result.current.hasNext).toBe(true);
  });

  it("navigates forward and backward", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(25) });

    const { result } = renderHook(() => usePaginatedTodos({ pageSize: 10 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => result.current.next());
    await waitFor(() => expect(result.current.page).toBe(1));
    await waitFor(() =>
      expect(result.current.query.data?.items[0]?.id).toBe(11),
    );
    expect(result.current.hasPrevious).toBe(true);

    act(() => result.current.previous());
    await waitFor(() => expect(result.current.page).toBe(0));
    await waitFor(() =>
      expect(result.current.query.data?.items[0]?.id).toBe(1),
    );
  });

  it("clamps navigation at the boundaries", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(5) });

    const { result } = renderHook(() => usePaginatedTodos({ pageSize: 10 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    expect(result.current.hasNext).toBe(false);
    act(() => result.current.previous());
    expect(result.current.page).toBe(0);

    act(() => result.current.goTo(-5));
    expect(result.current.page).toBe(0);
  });

  it("jumps to an arbitrary page via goTo", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(25) });

    const { result } = renderHook(() => usePaginatedTodos({ pageSize: 10 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));

    act(() => result.current.goTo(2));
    await waitFor(() => expect(result.current.page).toBe(2));
    await waitFor(() =>
      expect(result.current.query.data?.items).toHaveLength(5),
    );
    expect(result.current.hasNext).toBe(false);
  });

  it("honors the initialPage option", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(25) });

    const { result } = renderHook(
      () => usePaginatedTodos({ pageSize: 10, initialPage: 1 }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
    expect(result.current.page).toBe(1);
    expect(result.current.query.data?.items[0]?.id).toBe(11);
  });
});
