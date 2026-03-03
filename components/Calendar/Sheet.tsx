"use client";

import React, { useEffect } from "react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        aria-label="Close sheet"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        type="button"
      />
      {/* sheet */}
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-3xl bg-white shadow-[0_-20px_40px_rgba(0,0,0,0.18)]">
        <div className="px-4 pt-3">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-200" />
          {title ? (
            <div className="mt-3 text-base font-semibold text-neutral-900">
              {title}
            </div>
          ) : null}
        </div>
        <div className="px-4 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}