"use client";

import { useSyncExternalStore } from "react";
import { apiMode } from "@femxo/shared";
import { getMockRuntime } from "../runtime";
import { DemoPanel } from "./DemoPanel";

const noSubscription = () => () => undefined;

/** Mounts the demo panel in the browser only: the mock runtime (IndexedDB) doesn't exist on the server. */
export function DemoPanelHost() {
  const controls = useSyncExternalStore(
    noSubscription,
    () => getMockRuntime()?.controls ?? null,
    () => null
  );
  return controls ? <DemoPanel controls={controls} mode={apiMode} /> : null;
}
