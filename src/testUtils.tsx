import { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider.js";
import { createFakeTodoApi, type FakeApiOptions, type TodoApi } from "./api.js";

/**
 * Shared test harness: a wrapper bound to a fresh QueryClient (retries off so
 * failed mutations reject deterministically) and an isolated fake API.
 */
export function makeHarness(options: FakeApiOptions = {}): {
  Wrapper: (props: { children: ReactNode }) => JSX.Element;
  queryClient: QueryClient;
  api: TodoApi;
} {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const api = createFakeTodoApi(options);

  function Wrapper({ children }: { children: ReactNode }): JSX.Element {
    return (
      <QueryProvider client={queryClient} api={api}>
        {children}
      </QueryProvider>
    );
  }

  return { Wrapper, queryClient, api };
}

/** Build N sequential todos for pagination tests. */
export function manyTodos(count: number, userId = 1) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Todo ${i + 1}`,
    completed: i % 2 === 0,
    userId,
  }));
}
