"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

export default function TopBar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const onBrandClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/");
  };

  return (
    <header className="topbar sticky top-0 z-40 overflow-hidden bg-white/90 backdrop-blur">
      <div className="relative flex items-center justify-center px-5 py-4">
        <button
          type="button"
          onClick={onBrandClick}
          className="relative z-10 text-[22px] font-semibold tracking-[-0.01em] text-neutral-900 active:opacity-70 transition"
          aria-label="홈으로"
        >
          공무원 노트
        </button>

        <button
          onClick={onMenu}
          aria-label="메뉴 열기"
          className="absolute right-5 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 active:scale-[0.98]"
        >
          <span className="block w-4">
            <span className="mb-1 block h-[1.5px] w-full rounded bg-neutral-800" />
            <span className="mb-1 block h-[1.5px] w-full rounded bg-neutral-800" />
            <span className="block h-[1.5px] w-full rounded bg-neutral-800" />
          </span>
        </button>
      </div>

      <div className="relative z-10 h-px w-full bg-neutral-100" />

      {/* TopBar 전용 dim overlay */}
      <div className="topbar-overlay pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity bg-black/35" />
    </header>
  );
}