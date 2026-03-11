"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
export default function BottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
  zIndexClass = "z-[200]",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  zIndexClass?: string;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={`fixed inset-0 ${zIndexClass}`}>
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="닫기"
        type="button"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
          <button
      onClick={onClose}
      className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
      type="button"
      aria-label="닫기"
    >
      <X size={18} />
    </button>
        </div>

        <div className="px-5 pt-4 pb-3">{children}</div>
        {footer ? <div className="px-5 pb-5">{footer}</div> : <div className="pb-5" />}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>,
    document.body
  );
}