"use client";

import { apiMode } from "@femxo/shared";
import { createMockAdapter, createIdbStore, createMemoryStore, createRouter } from "@femxo/shared/mock";
import type { IdempotencyRecord } from "@femxo/shared/mock";
import { buildCatalog, buildInitialState, createDemoControls } from "@femxo/shared/demo";
import type { MockState } from "@femxo/shared/demo";

/**
 * The browser's mock backend: state in IndexedDB, the REST-shaped adapter,
 * and the demo controls that act on it. Built once, on first use; handlers
 * are added module by module as the storefront grows.
 */
function build() {
  const catalog = buildCatalog();
  const seed = () => buildInitialState(catalog, new Date());
  const inBrowser = typeof indexedDB !== "undefined";
  const store = inBrowser ? createIdbStore<MockState>({ dbName: "femxo-demo", version: 1, seed }) : createMemoryStore(seed);
  const noKeys = (): Record<string, IdempotencyRecord> => ({});
  const idempotency = inBrowser
    ? createIdbStore({ dbName: "femxo-demo-keys", version: 1, seed: noKeys })
    : createMemoryStore(noKeys);

  const holder: { adapter?: ReturnType<typeof createMockAdapter<MockState>> } = {};
  const controls = createDemoControls(() => ({
    forceNext: (outcome) => holder.adapter!.controls.forceNext(outcome),
    clock: holder.adapter!.controls.clock,
    reload: () => holder.adapter!.controls.reload(),
    resetStores: async () => {
      await store.reset();
      await idempotency.reset();
    },
  }));
  holder.adapter = createMockAdapter<MockState>({
    router: createRouter<MockState>(),
    store,
    idempotencyStore: idempotency,
    chaos: controls.chaos,
  });
  return { adapter: holder.adapter, controls, catalog };
}

let runtime: ReturnType<typeof build> | undefined;
export const getMockRuntime = () => (apiMode === "mock" ? (runtime ??= build()) : null);
