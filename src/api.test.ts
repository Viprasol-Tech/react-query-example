import { describe, it, expect } from "vitest";
import { createFakeTodoApi } from "./api.js";
import { manyTodos } from "./testUtils.js";

describe("createFakeTodoApi", () => {
  it("isolates state between instances", async () => {
    const a = createFakeTodoApi({ seed: [] });
    const b = createFakeTodoApi({ seed: [] });

    await a.addTodo({ title: "only in a" });
    expect(await a.getTodos()).toHaveLength(1);
    expect(await b.getTodos()).toHaveLength(0);
  });

  it("toggles completion", async () => {
    const api = createFakeTodoApi({
      seed: [{ id: 1, title: "x", completed: false }],
    });
    const toggled = await api.toggleTodo(1);
    expect(toggled.completed).toBe(true);
    const again = await api.toggleTodo(1);
    expect(again.completed).toBe(false);
  });

  it("updates fields and validates title", async () => {
    const api = createFakeTodoApi({
      seed: [{ id: 1, title: "x", completed: false }],
    });
    const updated = await api.updateTodo(1, { title: "renamed" });
    expect(updated.title).toBe("renamed");
    await expect(api.updateTodo(1, { title: "  " })).rejects.toThrow(
      "must not be empty",
    );
  });

  it("throws for unknown ids", async () => {
    const api = createFakeTodoApi({ seed: [] });
    await expect(api.toggleTodo(404)).rejects.toThrow("not found");
    await expect(api.getUser(404)).rejects.toThrow("not found");
  });

  it("paginates with an offset cursor", async () => {
    const api = createFakeTodoApi({ seed: manyTodos(25) });

    const first = await api.getTodoPage({ cursor: 0, limit: 10 });
    expect(first.items).toHaveLength(10);
    expect(first.total).toBe(25);
    expect(first.nextCursor).toBe(10);

    const last = await api.getTodoPage({ cursor: 20, limit: 10 });
    expect(last.items).toHaveLength(5);
    expect(last.nextCursor).toBeNull();
  });

  it("filters todos by user", async () => {
    const api = createFakeTodoApi({
      seed: [
        { id: 1, title: "a", completed: false, userId: 1 },
        { id: 2, title: "b", completed: false, userId: 2 },
      ],
    });
    expect(await api.getTodosByUser(1)).toHaveLength(1);
    expect(await api.getTodosByUser(2)).toHaveLength(1);
    expect(await api.getTodosByUser(3)).toHaveLength(0);
  });
});
