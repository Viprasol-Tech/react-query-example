import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider.js";
import { useTodos } from "./useTodos.js";
import { useToggleTodo } from "./useToggleTodo.js";
import { useUpdateTodo } from "./useUpdateTodo.js";
import { createFakeTodoApi, type Todo, type TodoApi } from "./api.js";
import { queryKeys } from "./queryKeys.js";
import { makeHarness } from "./testUtils.js";

const seed: Todo[] = [
  { id: 1, title: "Alpha", completed: false, userId: 1 },
  { id: 2, title: "Beta", completed: true, userId: 1 },
];

describe("useToggleTodo (optimistic)", () => {
  it("flips completed and persists on success", async () => {
    const { Wrapper } = makeHarness({ seed });

    const { result } = renderHook(
      () => ({ todos: useTodos(), toggle: useToggleTodo() }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.todos.isSuccess).toBe(true));
    expect(result.current.todos.data?.[0]?.completed).toBe(false);

    await act(async () => {
      await result.current.toggle.mutateAsync(1);
    });

    await waitFor(() =>
      expect(
        result.current.todos.data?.find((t) => t.id === 1)?.completed,
      ).toBe(true),
    );
  });

  it("rolls back to the previous value when the api throws", async () => {
    // Wrap a real fake api but force toggleTodo to fail.
    const base = createFakeTodoApi({ seed });
    const failing: TodoApi = {
      ...base,
      toggleTodo: () => Promise.reject(new Error("boom")),
    };

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryProvider client={queryClient} api={failing}>
          {children}
        </QueryProvider>
      );
    }

    const { result } = renderHook(
      () => ({ todos: useTodos(), toggle: useToggleTodo() }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.todos.isSuccess).toBe(true));
    expect(result.current.todos.data?.[0]?.completed).toBe(false);

    await act(async () => {
      await result.current.toggle.mutateAsync(1).catch(() => undefined);
    });

    // After rollback the optimistic flip must be undone.
    await waitFor(() => expect(result.current.toggle.isError).toBe(true));
    expect(
      result.current.todos.data?.find((t) => t.id === 1)?.completed,
    ).toBe(false);
  });
});

describe("useUpdateTodo (optimistic)", () => {
  it("applies a patch optimistically and persists it", async () => {
    const { Wrapper, api } = makeHarness({ seed });

    const { result } = renderHook(
      () => ({ todos: useTodos(), update: useUpdateTodo() }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.todos.isSuccess).toBe(true));

    await act(async () => {
      await result.current.update.mutateAsync({
        id: 1,
        patch: { title: "Alpha v2" },
      });
    });

    await waitFor(() =>
      expect(
        result.current.todos.data?.find((t) => t.id === 1)?.title,
      ).toBe("Alpha v2"),
    );

    const fresh = await api.getTodos();
    expect(fresh.find((t) => t.id === 1)?.title).toBe("Alpha v2");
  });

  it("rolls back a failed patch", async () => {
    const base = createFakeTodoApi({ seed });
    const failing: TodoApi = {
      ...base,
      updateTodo: () => Promise.reject(new Error("nope")),
    };

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryProvider client={queryClient} api={failing}>
          {children}
        </QueryProvider>
      );
    }

    const { result } = renderHook(
      () => ({ todos: useTodos(), update: useUpdateTodo() }),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.todos.isSuccess).toBe(true));

    await act(async () => {
      await result.current.update
        .mutateAsync({ id: 1, patch: { title: "Will revert" } })
        .catch(() => undefined);
    });

    await waitFor(() => expect(result.current.update.isError).toBe(true));
    expect(
      result.current.todos.data?.find((t) => t.id === 1)?.title,
    ).toBe("Alpha");
  });

  it("invalidates all todo queries on settle", async () => {
    const { Wrapper, queryClient } = makeHarness({ seed });
    const listKey = queryKeys.todos.list();

    const { result } = renderHook(() => useUpdateTodo(), { wrapper: Wrapper });

    queryClient.setQueryData(listKey, seed);
    expect(queryClient.getQueryState(listKey)?.isInvalidated ?? false).toBe(
      false,
    );

    await act(async () => {
      await result.current.mutateAsync({ id: 1, patch: { completed: true } });
    });

    await waitFor(() =>
      expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true),
    );
  });
});
