"use client";

import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * Says when the connection drops. The live region is always present so the
 * message is read out when it appears.
 */
export function OfflineBanner({ message = "You're offline. What's already loaded still works; we'll reconnect automatically." }: { message?: string }) {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  return (
    <div role="status" aria-live="polite">
      {online ? null : (
        <p className="flex items-center justify-center gap-2 bg-warning-soft px-4 py-2 text-center text-sm font-medium text-warning">
          <WifiOff size={16} aria-hidden="true" />
          {message}
        </p>
      )}
    </div>
  );
}
