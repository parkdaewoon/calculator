"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode; 
  children: React.ReactNode;

  /** ✅ 상단 회색 핸들(윗줄처럼 보이는 것) 표시 여부 */
  showHandle?: boolean;

  /** ✅ 제목 옆 X 버튼 표시 여부 */
  showCloseButton?: boolean;

  /** ✅ 하단 구분선(아랫줄) 표시 여부 */
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
          "max-h-[85dvh] overflow-hidden",
          "pb-[env(safe-area-inset-bottom)]",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        {/* header (고정) */}
        <div className="sticky top-0 z-10 bg-white px-4 pt-3">
          {/* ✅ 윗줄처럼 보이는 핸들 */}
          {showHandle ? (
            <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-200" />
          ) : null}

          {/* ✅ title + X */}
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

          {/* ✅ 아랫줄(divider) */}
          {showDivider ? <div className="mt-3 h-px bg-neutral-100" /> : null}
        </div>

        {/* body (여기만 스크롤) */}
        <div className="px-4 pb-6 pt-4 overflow-y-auto overscroll-contain max-h-[calc(85dvh-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
}