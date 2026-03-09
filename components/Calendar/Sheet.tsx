"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  showDivider?: boolean;
};

export default function Sheet({
  open,
  onClose,
  title,
  children,
  showHandle = true,
  showCloseButton = false,
  showDivider = true,
}: SheetProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close sheet"
        onClick={onClose}
        className="absolute inset-0 bg-black/18"
      />

      {/* panel wrapper */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div
          className={[
            "w-full max-w-[430px]",
            "max-h-[85dvh] overflow-hidden rounded-t-3xl bg-white",
            "shadow-[0_-12px_28px_rgba(0,0,0,0.12)]",
            "flex flex-col pb-[env(safe-area-inset-bottom)]",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          <div className="sticky top-0 z-10 bg-white px-4 pt-3">
            {showHandle ? (
              <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-200" />
            ) : null}

            {title ? (
              <div className="mt-3 flex w-full items-center justify-between">
                <div className="flex-1 text-base font-semibold text-neutral-900">
                  {title}
                </div>

                {showCloseButton ? (
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                    type="button"
                    aria-label="닫기"
                  >
                    <X size={18} />
                  </button>
                ) : null}
              </div>
            ) : null}

            {showDivider ? <div className="mt-3 h-px bg-neutral-100" /> : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}