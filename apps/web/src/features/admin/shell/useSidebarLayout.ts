"use client";

import { useRef, useState, useSyncExternalStore } from "react";

/*
 * The sidebar behaves like VS Code's side bar:
 *   ≥1280  pinned; drag its edge to resize, drag it narrow to collapse it to
 *          an icon rail, ☰ / Ctrl+B toggles rail ↔ full. Remembered per browser.
 *   768–1279  starts as the icon rail; ☰ / Ctrl+B expands it in place and the
 *          page reflows beside it (not an overlay), as on desktop.
 *   <768   phone: no room to share the width, so bottom navigation + drawer.
 */

export type Viewport = "phone" | "tablet" | "desktop";

export const RAIL_WIDTH = 72;
export const DEFAULT_WIDTH = 272;
export const MIN_WIDTH = 216;
export const MAX_WIDTH = 400;
/** Dragged narrower than this, the sidebar snaps to the rail. */
const SNAP_TO_RAIL = 150;

const STORAGE_KEY = "femxo-admin-sidebar";
const DESKTOP = "(min-width: 1280px)";
const TABLET = "(min-width: 768px)";

function subscribeViewport(onChange: () => void) {
  const queries = [window.matchMedia(DESKTOP), window.matchMedia(TABLET)];
  queries.forEach((query) => query.addEventListener("change", onChange));
  return () => queries.forEach((query) => query.removeEventListener("change", onChange));
}

function viewportSnapshot(): Viewport {
  if (window.matchMedia(DESKTOP).matches) return "desktop";
  return window.matchMedia(TABLET).matches ? "tablet" : "phone";
}

export function useViewport() {
  // The panel renders only in the browser (after the session check), so the
  // server snapshot is never shown.
  return useSyncExternalStore(subscribeViewport, viewportSnapshot, () => "desktop" as Viewport);
}

interface Prefs {
  width: number;
  collapsed: boolean;
}

const clampWidth = (width: number) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(width)));

function readPrefs(): Prefs {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Prefs> | null;
    return {
      width: typeof saved?.width === "number" ? clampWidth(saved.width) : DEFAULT_WIDTH,
      collapsed: saved?.collapsed === true,
    };
  } catch {
    return { width: DEFAULT_WIDTH, collapsed: false };
  }
}

function savePrefs(prefs: Prefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode or storage full: the layout still works, it just isn't remembered.
  }
}

export function useSidebarLayout() {
  const viewport = useViewport();
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const [resizing, setResizing] = useState(false);
  const dragStartWidth = useRef(prefs.width);
  // Tablets start on the rail each visit; the narrow screen is for content first.
  const [tabletExpanded, setTabletExpanded] = useState(false);

  const rail = viewport === "tablet" ? !tabletExpanded : viewport === "desktop" && prefs.collapsed;
  // Expanded on a tablet, the sidebar keeps to the default width so the page keeps room.
  const fullWidth = viewport === "tablet" ? Math.min(prefs.width, DEFAULT_WIDTH) : prefs.width;
  const pinnedWidth = viewport === "phone" ? 0 : rail ? RAIL_WIDTH : fullWidth;

  function update(next: Prefs, persist = true) {
    setPrefs(next);
    if (persist) savePrefs(next);
  }

  return {
    viewport,
    rail,
    pinnedWidth,
    width: prefs.width,
    resizing,
    toggleCollapsed: () => update({ ...prefs, collapsed: !prefs.collapsed }),
    /** ☰ / Ctrl+B on a desktop or tablet: rail ↔ full, the page reflowing beside it. */
    toggleSidebar: () => {
      if (viewport === "tablet") setTabletExpanded((value) => !value);
      else update({ ...prefs, collapsed: !prefs.collapsed });
    },
    /**
     * Width follows the pointer; too narrow snaps to the rail, which keeps the
     * width the drag started from (passing the minimum on the way doesn't
     * shrink it), so expanding again restores it, as in VS Code. Saved when
     * the drag ends.
     */
    dragTo: (x: number) =>
      update(
        x < SNAP_TO_RAIL ? { width: dragStartWidth.current, collapsed: true } : { width: clampWidth(x), collapsed: false },
        false
      ),
    /** The drawer only resizes: it never snaps to the rail. */
    resizeTo: (x: number) => update({ ...prefs, width: clampWidth(x) }, false),
    nudgeWidth: (delta: number) => update({ ...prefs, width: clampWidth(prefs.width + delta) }),
    startResize: () => {
      dragStartWidth.current = prefs.width;
      setResizing(true);
    },
    endResize: () => {
      setResizing(false);
      savePrefs(prefs);
    },
    /** Keyboard resizing from the sash: ← narrower (then rail), → wider (out of the rail first). */
    nudge: (delta: number) => {
      if (prefs.collapsed) {
        if (delta > 0) update({ ...prefs, collapsed: false });
        return;
      }
      const next = prefs.width + delta;
      update(next < MIN_WIDTH ? { ...prefs, collapsed: true } : { ...prefs, width: clampWidth(next) });
    },
    reset: () => update({ width: DEFAULT_WIDTH, collapsed: false }),
  };
}
