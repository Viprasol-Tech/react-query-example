import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider.js";
import { useTodos } from "./useTodos.js";
import { useAddTodo } from "./useAddTodo.js";
import { createFakeTodoApi, type Todo } from "./api.js";

/** Build a wrapper with a fresh QueryClient (retries off) and a fake API. */
function makeWrapper(seed?: Todo[]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const api = createFakeTodoApi(seed);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryProvider client={queryClient} api={api}>
        {children}
      </QueryProvider>
    );
  }

  return { Wrapper, queryClient, api };
}

describe("useTodos", () => {
  it("resolves data from the fake client", async () => {
    const seed: Todo[] = [
      { id: 1, title: "First", completed: false },
      { id: 2, title: "Second", completed: true },
    ];
    const { Wrapper } = makeWrapper(seed);

    const { result } = renderHook(() => useTodos(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toEqual({
      id: 1,
      title: "First",
      completed: false,
    });
  });

  it("starts in a loading state before resolving", async () => {
    const { Wrapper } = makeWrapper([]);
    const { result } = renderHook(() => useTodos(), { wrapper: Wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("useAddTodo", () => {
  it("creates a todo and updates the cache", async () => {
    const seed: Todo[] = [{ id: 1, title: "Existing", completed: false }];
    const { Wrapper } = makeWrapper(seed);

    const { result } = renderHook(
      () => ({ todos: useTodos(), add: useAddTodo() }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.todos.isSuccess).toBe(true));
    expect(result.current.todos.data).toHaveLength(1);

    await act(async () => {
      await result.current.add.mutateAsync({ title: "Brand new" });
    });

    // Cache was updated by the mutation's onSuccess handler.
    await waitFor(() =>
      expect(result.current.todos.data).toHaveLength(2),
    );

    const titles = result.current.todos.data?.map((t) => t.title);
    expect(titles).toContain("Brand new");
  });

  it("invalidates the todos query on success", async () => {
    const { Wrapper, queryClient } = makeWrapper([]);

    const { result } = renderHook(() => useAddTodo(), { wrapper: Wrapper });

    // Prime the cache so we can observe invalidation flip it to stale.
    queryClient.setQueryData(["todos"], []);
    expect(
      queryClient.getQueryState(["todos"])?.isInvalidated ?? false,
    ).toBe(false);

    await act(async () => {
      await result.current.mutateAsync({ title: "Triggers invalidation" });
    });

    await waitFor(() =>
      expect(
        queryClient.getQueryState(["todos"])?.isInvalidated,
      ).toBe(true),
    );
  });

  it("surfaces errors from the api client", async () => {
    const { Wrapper } = makeWrapper([]);
    const { result } = renderHook(() => useAddTodo(), { wrapper: Wrapper });

    await expect(
      act(async () => {
        await result.current.mutateAsync({ title: "   " });
      }),
    ).rejects.toThrow("Todo title must not be empty");
  });
});
