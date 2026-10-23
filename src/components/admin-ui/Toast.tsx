"use client";

import { Check, CircleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

type ToastTone = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null);

/** Foundations feedback toast ("Dealer approved. Written to audit log."). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string, tone: ToastTone = "success") => {
    const id = nextId.current++;
    setItems((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 4500);
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fx-toast-region" role="status" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className="fx-toast">
            <span
              className="fx-toast-icon"
              style={{ background: item.tone === "success" ? "var(--fx-success)" : "var(--fx-error)" }}
              aria-hidden="true"
            >
              {item.tone === "success" ? <Check size={16} strokeWidth={3} /> : <CircleAlert size={16} />}
            </span>
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider.");
  return context;
}
