"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "femxo-theme";
const THEME_CHANGE_EVENT = "femxo-theme-change";

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

function subscribeToTheme(onStoreChange: () => void) {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = (event: MediaQueryListEvent) => {
    if (window.localStorage.getItem(THEME_STORAGE_KEY) !== null) return;

    applyTheme(event.matches);
    onStoreChange();
  };
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;

    const isDark =
      event.key === THEME_STORAGE_KEY && event.newValue !== null
        ? event.newValue === "dark"
        : systemTheme.matches;
    applyTheme(isDark);
    onStoreChange();
  };

  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorageChange);
  systemTheme.addEventListener("change", handleSystemThemeChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
    systemTheme.removeEventListener("change", handleSystemThemeChange);
  };
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot() {
  return false;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  function toggleTheme() {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    applyTheme(nextIsDark);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-current/15 bg-current/5 text-inherit transition-colors hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {isDark ? (
        <Sun aria-hidden="true" className="size-[18px]" />
      ) : (
        <Moon aria-hidden="true" className="size-[18px]" />
      )}
    </button>
  );
}
