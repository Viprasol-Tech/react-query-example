/**
 * Domain types and the pluggable API client contract used by the example hooks.
 *
 * The default export is an in-memory fake client so that the example hooks and
 * their tests run without any network access. Swap in a real implementation
 * (e.g. one backed by `fetch`) by passing a different client to the provider.
 */

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

/** Payload accepted when creating a new todo. */
export interface NewTodo {
  title: string;
  completed?: boolean;
}

/**
 * The contract every API client must satisfy. Hooks depend only on this
 * interface, never on a concrete implementation, which keeps them testable.
 */
export interface TodoApi {
  getTodos(): Promise<Todo[]>;
  addTodo(input: NewTodo): Promise<Todo>;
}

/**
 * Creates an in-memory {@link TodoApi}. State lives in a closure so each call
 * produces an isolated client — handy for tests that need a clean slate.
 */
export function createFakeTodoApi(seed: Todo[] = defaultSeed()): TodoApi {
  const todos: Todo[] = seed.map((t) => ({ ...t }));
  let nextId =
    todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;

  return {
    async getTodos(): Promise<Todo[]> {
      // Return copies so callers cannot mutate internal state.
      return todos.map((t) => ({ ...t }));
    },

    async addTodo(input: NewTodo): Promise<Todo> {
      const title = input.title.trim();
      if (title.length === 0) {
        throw new Error("Todo title must not be empty");
      }
      const todo: Todo = {
        id: nextId++,
        title,
        completed: input.completed ?? false,
      };
      todos.push(todo);
      return { ...todo };
    },
  };
}

function defaultSeed(): Todo[] {
  return [
    { id: 1, title: "Learn TanStack Query", completed: true },
    { id: 2, title: "Write typed hooks", completed: false },
  ];
}
