"use client";

import React, { useEffect } from "react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Sheet({ open, onClose, title, children }: SheetProps) {
  // ✅ ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // ✅ 배경(body) 스크롤 잠금 (iOS 포함)
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;

    const scrollY = window.scrollY;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      const y = Math.abs(parseInt(body.style.top || "0", 10)) || 0;
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo(0, y);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overscroll-contain">
      {/* backdrop */}
      <button
        aria-label="Close sheet"
        className="absolute inset-0 bg-black/40 touch-none"
        onClick={onClose}
        type="button"
      />

      {/* sheet panel */}
      <div
        className={[
          "absolute inset-x-0 bottom-0 mx-auto w-full max-w-md",
          "rounded-t-3xl bg-white",
          "shadow-[0_-20px_40px_rgba(0,0,0,0.18)]",
          "max-h-[85dvh] overflow-hidden", // ✅ 패널 자체 고정
          "pb-[env(safe-area-inset-bottom)]", // ✅ iOS 하단 안전영역
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        {/* header (고정) */}
        <div className="sticky top-0 z-10 bg-white px-4 pt-3">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-200" />
          {title ? (
            <div className="mt-3 text-base font-semibold text-neutral-900">
              {title}
            </div>
          ) : null}
          <div className="mt-3 h-px bg-neutral-100" />
        </div>

        {/* body (여기만 스크롤) */}
        <div className="px-4 pb-6 pt-4 overflow-y-auto overscroll-contain max-h-[calc(85dvh-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
}