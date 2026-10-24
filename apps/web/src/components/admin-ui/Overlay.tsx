"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Opens a native <dialog> as modal while `open` is true. The browser gives
 * us the focus trap, Esc to close, an inert background, and focus returning
 * to the opener, which a hand-rolled overlay easily gets wrong.
 */
function useModalDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    // Next keeps a page mounted but hidden after navigating away (Activity),
    // and a hidden page runs no effects. A dialog closing just as its page
    // hides would stay modal and make the visible page inert, so close it
    // here; cleanups do run on hide, and it reopens if the page is shown.
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Esc fires "cancel"; keep React state the single source of truth.
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  return ref;
}

function CloseButton({ onClose, label }: { onClose: () => void; label: string }) {
  return (
    <button type="button" className="fx-btn fx-btn--ghost fx-btn--icon fx-btn--sm" aria-label={label} onClick={onClose}>
      <X size={18} aria-hidden="true" />
    </button>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const ref = useModalDialog(open, onClose);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cn("fx-dialog", className)}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> element itself.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open ? (
        <div className="flex max-h-[calc(100dvh-34px)] flex-col">
          <header className="flex items-start justify-between gap-3 px-6 pt-6">
            <div>
              <h2 id={titleId} className="fx-card-title">
                {title}
              </h2>
              {description ? <p className="mt-1 text-[13px] fx-muted">{description}</p> : null}
            </div>
            <CloseButton onClose={onClose} label="Close dialog" />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer ? <footer className="flex flex-wrap justify-end gap-3 px-6 pb-6">{footer}</footer> : null}
        </div>
      ) : null}
    </dialog>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useModalDialog(open, onClose);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="fx-drawer"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open ? (
        <>
          <header className="flex items-start justify-between gap-3 border-b border-[var(--fx-border)] px-6 py-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id={titleId} className="fx-card-title">
                  {title}
                </h2>
                {badge}
              </div>
              {subtitle ? <p className="mt-1 text-[13px] fx-muted">{subtitle}</p> : null}
            </div>
            <CloseButton onClose={onClose} label="Close details" />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer ? (
            <footer className="flex flex-wrap justify-end gap-3 border-t border-[var(--fx-border)] px-6 py-4">{footer}</footer>
          ) : null}
        </>
      ) : null}
    </dialog>
  );
}
