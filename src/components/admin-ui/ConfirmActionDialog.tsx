"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Checkbox } from "./FormField";
import { Dialog } from "./Overlay";

export type ConfirmKind = "financial" | "destructive";

/**
 * Foundations "Confirm financial action": names the amount and the record,
 * and the confirm button stays disabled until the user ticks
 * "I understand this cannot be undone".
 */
export function ConfirmActionDialog({
  open,
  onClose,
  onConfirm,
  kind,
  title,
  description,
  amount,
  amountLabel = "Amount affected",
  record,
  confirmLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  kind: ConfirmKind;
  title: string;
  description: string;
  amount?: string;
  amountLabel?: string;
  record: string;
  confirmLabel: string;
}) {
  const [understood, setUnderstood] = useState(false);

  const close = () => {
    setUnderstood(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            variant={kind === "financial" ? "gold" : "danger"}
            disabled={!understood}
            onClick={() => {
              setUnderstood(false);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        {amount ? (
          <div className="fx-confirm-amount">
            <span className="text-[13px] fx-muted">{amountLabel}</span>
            <span className="text-[26px] font-semibold tracking-[-0.025em]">{amount}</span>
          </div>
        ) : null}
        <p className="text-[13px]">
          <span className="font-semibold">Affected record:</span> {record}
        </p>
        <Checkbox checked={understood} onChange={setUnderstood}>
          I understand this cannot be undone.
        </Checkbox>
      </div>
    </Dialog>
  );
}
