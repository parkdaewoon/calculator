"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  children: React.ReactNode;
  minDurationMs?: number; // 스플래시 최소 노출 시간
};

function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;

  // iOS Safari 홈화면 실행 감지
  const iosStandalone = (window.navigator as any)?.standalone === true;

  // 일반 PWA display-mode 감지
  const mql =
    window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;

  return iosStandalone || mql;
}

export default function SplashScreen({ children, minDurationMs = 900 }: Props) {
  const shouldShow = useMemo(() => isStandalonePWA(), []);
  const [ready, setReady] = useState(!shouldShow);

  useEffect(() => {
    if (!shouldShow) return;

    const t = setTimeout(() => setReady(true), minDurationMs);
    return () => clearTimeout(t);
  }, [shouldShow, minDurationMs]);

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center text-center">
          {/* 로고/아이콘 */}
          <img
            src="/icon-192.png"
            alt="공무원 노트"
            className="h-16 w-16"
            draggable={false}
          />

          <div className="mt-4 text-[18px] font-semibold text-neutral-900">
            공무원 노트
          </div>

          {/* ✅ 요청한 컬러 */}
          <div className="mt-1 text-[12px] font-semibold tracking-[0.24em] text-neutral-400">
            NOTE KOREAN OFFICER
          </div>

          {/* 로딩 점 */}
          <div className="mt-5 flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300 [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}