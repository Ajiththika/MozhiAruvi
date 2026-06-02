"use client";

import React, { useCallback, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve?: (value: boolean) => void;
}

/**
 * Promise-based confirmation dialog that matches the app's Modal styling.
 * Replaces native window.confirm() in admin views.
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   if (!(await confirm({ message: "Delete this?", danger: true }))) return;
 *   ...render {ConfirmDialog} once in the component tree.
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({ open: false, message: "" });

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, open: true, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      setState((prev) => {
        prev.resolve?.(result);
        return { ...prev, open: false, resolve: undefined };
      });
    },
    []
  );

  const ConfirmDialog = (
    <Modal
      isOpen={state.open}
      onClose={() => close(false)}
      title={state.title || "Please confirm"}
      size="sm"
    >
      <div className="space-y-8">
        <p className="text-base font-semibold text-text-secondary leading-relaxed">
          {state.message}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => close(false)}>
            {state.cancelText || "Cancel"}
          </Button>
          <Button
            variant={state.danger ? "danger" : "primary"}
            onClick={() => close(true)}
          >
            {state.confirmText || "Confirm"}
          </Button>
        </div>
      </div>
    </Modal>
  );

  return { confirm, ConfirmDialog };
}

export default useConfirm;
