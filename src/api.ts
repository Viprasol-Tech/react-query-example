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
  /** Optional owner/user id, used by the dependent-query example. */
  userId?: number;
}

/** Payload accepted when creating a new todo. */
export interface NewTodo {
  title: string;
  completed?: boolean;
  userId?: number;
}

/** Fields that may be patched on an existing todo. */
export interface TodoPatch {
  title?: string;
  completed?: boolean;
}

/** A minimal user record used by the dependent-query example. */
export interface User {
  id: number;
  name: string;
}

/**
 * A single page of todos plus a cursor describing how to fetch the next one.
 * `nextCursor` is `null` when there are no more pages.
 */
export interface TodoPage {
  items: Todo[];
  nextCursor: number | null;
  total: number;
}

/** Options accepted by {@link TodoApi.getTodoPage}. */
export interface PageQuery {
  /** Zero-based item offset to start the page at. Defaults to `0`. */
  cursor?: number;
  /** Maximum number of items in the page. Defaults to `10`. */
  limit?: number;
}

/**
 * The contract every API client must satisfy. Hooks depend only on this
 * interface, never on a concrete implementation, which keeps them testable.
 */
export interface TodoApi {
  getTodos(): Promise<Todo[]>;
  addTodo(input: NewTodo): Promise<Todo>;
  updateTodo(id: number, patch: TodoPatch): Promise<Todo>;
  toggleTodo(id: number): Promise<Todo>;
  /** Fetch a single page of todos using an offset cursor. */
  getTodoPage(query?: PageQuery): Promise<TodoPage>;
  /** Fetch a single user by id (used by the dependent-query example). */
  getUser(id: number): Promise<User>;
  /** Fetch every todo belonging to a given user. */
  getTodosByUser(userId: number): Promise<Todo[]>;
}

/** Tunables for {@link createFakeTodoApi}, mainly to make tests deterministic. */
export interface FakeApiOptions {
  /** Initial todos. Defaults to a small built-in seed. */
  seed?: Todo[];
  /** Initial users. Defaults to a small built-in seed. */
  users?: User[];
  /** Artificial latency in milliseconds applied to every call. Defaults to 0. */
  latencyMs?: number;
}

/**
 * Creates an in-memory {@link TodoApi}. State lives in a closure so each call
 * produces an isolated client — handy for tests that need a clean slate.
 */
export function createFakeTodoApi(options: FakeApiOptions = {}): TodoApi {
  const { seed = defaultSeed(), users = defaultUsers(), latencyMs = 0 } =
    options;

  const todos: Todo[] = seed.map((t) => ({ ...t }));
  const userList: User[] = users.map((u) => ({ ...u }));
  let nextId = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;

  const delay = (): Promise<void> =>
    latencyMs > 0
      ? new Promise((resolve) => setTimeout(resolve, latencyMs))
      : Promise.resolve();

  function findIndex(id: number): number {
    const idx = todos.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error(`Todo ${id} not found`);
    }
    return idx;
  }

  return {
    async getTodos(): Promise<Todo[]> {
      await delay();
      // Return copies so callers cannot mutate internal state.
      return todos.map((t) => ({ ...t }));
    },

    async addTodo(input: NewTodo): Promise<Todo> {
      await delay();
      const title = input.title.trim();
      if (title.length === 0) {
        throw new Error("Todo title must not be empty");
      }
      const todo: Todo = {
        id: nextId++,
        title,
        completed: input.completed ?? false,
        userId: input.userId,
      };
      todos.push(todo);
      return { ...todo };
    },

    async updateTodo(id: number, patch: TodoPatch): Promise<Todo> {
      await delay();
      const idx = findIndex(id);
      if (patch.title !== undefined) {
        const title = patch.title.trim();
        if (title.length === 0) {
          throw new Error("Todo title must not be empty");
        }
        todos[idx]!.title = title;
      }
      if (patch.completed !== undefined) {
        todos[idx]!.completed = patch.completed;
      }
      return { ...todos[idx]! };
    },

    async toggleTodo(id: number): Promise<Todo> {
      await delay();
      const idx = findIndex(id);
      todos[idx]!.completed = !todos[idx]!.completed;
      return { ...todos[idx]! };
    },

    async getTodoPage(query: PageQuery = {}): Promise<TodoPage> {
      await delay();
      const cursor = Math.max(0, query.cursor ?? 0);
      const limit = Math.max(1, query.limit ?? 10);
      const slice = todos.slice(cursor, cursor + limit).map((t) => ({ ...t }));
      const end = cursor + slice.length;
      const nextCursor = end < todos.length ? end : null;
      return { items: slice, nextCursor, total: todos.length };
    },

    async getUser(id: number): Promise<User> {
      await delay();
      const user = userList.find((u) => u.id === id);
      if (user === undefined) {
        throw new Error(`User ${id} not found`);
      }
      return { ...user };
    },

    async getTodosByUser(userId: number): Promise<Todo[]> {
      await delay();
      return todos.filter((t) => t.userId === userId).map((t) => ({ ...t }));
    },
  };
}

function defaultSeed(): Todo[] {
  return [
    { id: 1, title: "Learn TanStack Query", completed: true, userId: 1 },
    { id: 2, title: "Write typed hooks", completed: false, userId: 1 },
  ];
}

function defaultUsers(): User[] {
  return [
    { id: 1, name: "Ada Lovelace" },
    { id: 2, name: "Alan Turing" },
  ];
}
