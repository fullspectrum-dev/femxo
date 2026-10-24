"use client";

import { Check, CircleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../cn";

type ToastTone = "success" | "error";
type ShowToast = (message: string, options?: { tone?: ToastTone; durationMs?: number }) => void;

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<ShowToast | null>(null);

/**
 * Short feedback ("Added to cart"). Success is announced politely, errors
 * assertively, from live regions that always exist (a region added at the
 * same moment as its text is often not read out).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), []);

  const show = useCallback<ShowToast>(
    (message, { tone = "success", durationMs } = {}) => {
      const id = nextId.current++;
      setItems((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), durationMs ?? (tone === "error" ? 8000 : 5000));
    },
    [dismiss]
  );

  const list = (tone: ToastTone) =>
    items
      .filter((item) => item.tone === tone)
      .map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-control bg-ink px-4 py-3 text-sm text-on-primary shadow-raised">
          <span
            aria-hidden="true"
            className={cn("grid h-6 w-6 flex-none place-items-center rounded-full", tone === "success" ? "bg-success" : "bg-danger")}
          >
            {tone === "success" ? <Check size={14} strokeWidth={3} /> : <CircleAlert size={14} />}
          </span>
          <p className="flex-1">{item.message}</p>
          <button
            type="button"
            aria-label="Dismiss"
            className="-mr-1 grid h-8 w-8 place-items-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-gold"
            onClick={() => dismiss(item.id)}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ));

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Above the phone bottom bar; bottom-right from tablet up. */}
      <div className="pointer-events-none fixed inset-x-4 bottom-20 z-50 grid gap-2 md:inset-x-auto md:bottom-6 md:right-6 md:w-96 [&>*>*]:pointer-events-auto">
        <div role="status" aria-live="polite" className="grid gap-2">
          {list("success")}
        </div>
        <div role="alert" aria-live="assertive" className="grid gap-2">
          {list("error")}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside <ToastProvider>.");
  return toast;
}
