import { createStore, get, set } from "idb-keyval";

/** Where the mock keeps its state: memory (server, tests) or IndexedDB (browser). */
export interface MockStore<S> {
  load(): Promise<S>;
  save(state: S): Promise<void>;
  /** Back to fresh seed data ("Reset demo data"). */
  reset(): Promise<S>;
}

export function createMemoryStore<S>(seed: () => S): MockStore<S> {
  let value: S | undefined;
  return {
    load: async () => (value ??= seed()),
    save: async (state) => {
      value = state;
    },
    reset: async () => (value = seed()),
  };
}

/**
 * Persists state in IndexedDB so demo carts and orders survive reloads.
 * Stored with a schema version: when the shape changes, old data is
 * replaced with fresh seed data instead of breaking the app.
 */
export function createIdbStore<S>({ dbName, version, seed }: { dbName: string; version: number; seed: () => S }): MockStore<S> {
  const db = createStore(dbName, "state");
  const write = async (data: S) => {
    await set("state", { version, data }, db);
    return data;
  };
  return {
    async load() {
      const record = await get<{ version: number; data: S }>("state", db);
      return record && record.version === version ? record.data : write(seed());
    },
    save: async (state) => {
      await write(state);
    },
    reset: () => write(seed()),
  };
}
