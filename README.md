<div align="center">
  <img src="docs/assets/logo.png" alt="Viprasol Tech" width="120" />

  <h1>react-query-example</h1>

  <p><strong>TanStack React Query examples — typed hooks, caching, and mutations.</strong></p>

  <p><em>Built and maintained by Viprasol Tech.</em></p>

  <p>
    <a href="https://github.com/Viprasol-Tech/react-query-example/actions"><img src="https://github.com/Viprasol-Tech/react-query-example/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
    <img src="https://img.shields.io/badge/TypeScript-strict-3178c6.svg" alt="TypeScript strict" />
  </p>
</div>

A small, fully-typed reference for [TanStack React Query](https://tanstack.com/query) v5. It shows how to build typed query and mutation hooks over a **pluggable** API client, how the cache is updated and invalidated, and how to test all of it with `renderHook` in jsdom — no network required.

## Features

- **Typed query hook** — `useTodos()` returns a fully inferred `UseQueryResult<Todo[], Error>`.
- **Typed mutation hook** — `useAddTodo()` creates a todo, writes it into the cache, and invalidates the list.
- **Pluggable API client** — hooks depend on a `TodoApi` interface; the default is an in-memory fake so nothing hits the network.
- **`QueryProvider` wrapper** — combines TanStack's `QueryClientProvider` with an API context in one component.
- **Centralized query keys** — typed keys keep cache invalidation predictable.
- **Real tests** — `vitest` + `@testing-library/react` in jsdom, with retries disabled in the test client.

## Install

```bash
npm install react-query-example @tanstack/react-query react react-dom
```

## Usage

Wrap your app in `QueryProvider`, then call the hooks:

```tsx
import { QueryProvider, useTodos, useAddTodo } from "react-query-example";

function TodoList() {
  const { data, isLoading, error } = useTodos();
  const addTodo = useAddTodo();

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <ul>
        {data?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
      <button onClick={() => addTodo.mutate({ title: "New todo" })}>
        Add todo
      </button>
    </>
  );
}

export function App() {
  return (
    <QueryProvider>
      <TodoList />
    </QueryProvider>
  );
}
```

### Plugging in a real client

`QueryProvider` accepts your own `TodoApi` and/or `QueryClient`:

```tsx
import { QueryClient } from "@tanstack/react-query";
import { QueryProvider, type TodoApi } from "react-query-example";

const realApi: TodoApi = {
  getTodos: () => fetch("/api/todos").then((r) => r.json()),
  addTodo: (input) =>
    fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify(input),
    }).then((r) => r.json()),
};

const client = new QueryClient();

<QueryProvider api={realApi} client={client}>
  {/* ... */}
</QueryProvider>;
```

## API notes

| Export | Description |
| --- | --- |
| `QueryProvider` | Wraps children with `QueryClientProvider` + API context. Props: `api?`, `client?`. |
| `useTodos()` | Query hook returning `UseQueryResult<Todo[], Error>`. |
| `useAddTodo()` | Mutation hook returning `UseMutationResult<Todo, Error, NewTodo>`. Updates and invalidates the cache on success. |
| `useTodoApi()` | Reads the active `TodoApi` from context (throws if used outside the provider). |
| `createFakeTodoApi(seed?)` | Builds an isolated in-memory `TodoApi`. |
| `queryKeys` | Centralized, typed query keys. |

Types `Todo`, `NewTodo`, and `TodoApi` are exported for your own client implementations.

## Development

```bash
npm install
npm run typecheck   # tsc --noEmit (strict)
npm test            # vitest run
npm run build       # tsc -> dist/
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

## Contact — Viprasol Tech Private Limited

- Website: [viprasol.com](https://viprasol.com)
- Email: [support@viprasol.com](mailto:support@viprasol.com)
- Telegram: [t.me/viprasol_help](https://t.me/viprasol_help) | WhatsApp: +91 96336 52112
- GitHub: [@Viprasol-Tech](https://github.com/Viprasol-Tech) | [LinkedIn](https://www.linkedin.com/in/viprasol/) | X [@viprasol](https://twitter.com/viprasol)

## License

[MIT](LICENSE) (c) 2025 Viprasol Tech Private Limited
