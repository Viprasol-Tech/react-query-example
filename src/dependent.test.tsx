import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUser, useTodosByUser } from "./useUserTodos.js";
import { makeHarness, manyTodos } from "./testUtils.js";

describe("useUser (dependent input)", () => {
  it("stays idle while userId is null", async () => {
    const { Wrapper } = makeHarness();
    const { result } = renderHook(() => useUser(null), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("loads the user once an id is supplied", async () => {
    const { Wrapper } = makeHarness();
    const { result } = renderHook(() => useUser(1), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Ada Lovelace");
  });
});

describe("useTodosByUser (chained query)", () => {
  it("does not run until enabled is true", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(4, 1) });
    const { result } = renderHook(() => useTodosByUser(1, false), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches a user's todos once enabled", async () => {
    const seed = [
      ...manyTodos(3, 1),
      { id: 99, title: "Other user", completed: false, userId: 2 },
    ];
    const { Wrapper } = makeHarness({ seed });

    const { result } = renderHook(() => useTodosByUser(1, true), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
    expect(result.current.data?.every((t) => t.userId === 1)).toBe(true);
  });

  it("models the full dependent chain: user then todos", async () => {
    const { Wrapper } = makeHarness({ seed: manyTodos(2, 1) });

    const { result } = renderHook(
      () => {
        const user = useUser(1);
        const todos = useTodosByUser(user.data?.id ?? null, user.isSuccess);
        return { user, todos };
      },
      { wrapper: Wrapper },
    );

    // todos must wait for the user to resolve first.
    await waitFor(() => expect(result.current.user.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.todos.isSuccess).toBe(true));
    expect(result.current.todos.data).toHaveLength(2);
  });
});
