"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Button } from "./Button";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-10 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-2xl rounded bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
