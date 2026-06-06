import { createContext, useContext, useMemo, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createFakeTodoApi, type TodoApi } from "./api.js";

/**
 * React context carrying the active {@link TodoApi}. Hooks read the client from
 * here so the data source can be swapped without touching call sites.
 */
const ApiContext = createContext<TodoApi | null>(null);

export interface QueryProviderProps {
  children: ReactNode;
  /** Optional API client. Defaults to an in-memory fake client. */
  api?: TodoApi;
  /** Optional QueryClient. A sensible default is created when omitted. */
  client?: QueryClient;
}

function createDefaultClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });
}

/**
 * Wraps children with both a TanStack {@link QueryClientProvider} and the API
 * context. Use at the root of your app (or in tests) to make the example hooks
 * work out of the box.
 */
export function QueryProvider({
  children,
  api,
  client,
}: QueryProviderProps): JSX.Element {
  // useMemo keeps the same instances across re-renders when not provided.
  const resolvedApi = useMemo(() => api ?? createFakeTodoApi(), [api]);
  const resolvedClient = useMemo(
    () => client ?? createDefaultClient(),
    [client],
  );

  return (
    <QueryClientProvider client={resolvedClient}>
      <ApiContext.Provider value={resolvedApi}>{children}</ApiContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * Returns the active {@link TodoApi}. Throws a clear error if used outside a
 * {@link QueryProvider}.
 */
export function useTodoApi(): TodoApi {
  const api = useContext(ApiContext);
  if (api === null) {
    throw new Error("useTodoApi must be used within a <QueryProvider>");
  }
  return api;
}
