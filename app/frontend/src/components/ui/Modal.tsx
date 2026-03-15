"use client";
import { useEffect, useRef } from "react";
import Button from "./Button";
import ko from "@/messages/ko.json";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function Modal({ open, onClose, title, children, actions }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/40 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-modal animate-slide-up p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="text-sm text-gray-600">{children}</div>
        <div className="flex gap-2 mt-5">
          {actions || (
            <>
              <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
                {ko.common.cancel}
              </Button>
              <Button variant="primary" size="md" className="flex-1" onClick={onClose}>
                {ko.common.confirm}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel, danger }: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            {ko.common.cancel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            size="md"
            className="flex-1"
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel || ko.common.confirm}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
